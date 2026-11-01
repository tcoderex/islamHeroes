import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';
import { deleteCommentsByGuest } from '@/lib/commentsStorage';

export interface BannedUser {
  email: string;
  googleId?: string;
  userName: string;
  picture?: string;
  reason?: string;
  bannedAt: number;
  bannedBy?: string;
}

const BANNED_DATA_FILE = path.join(process.cwd(), 'data', 'banned_users.json');
const BANNED_STORE_ID = '__banned_users_store__';

let bannedCache: BannedUser[] | null = null;

function ensureDataDir() {
  const dir = path.dirname(BANNED_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLocalBanned(): BannedUser[] {
  try {
    ensureDataDir();
    if (fs.existsSync(BANNED_DATA_FILE)) {
      const content = fs.readFileSync(BANNED_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as BannedUser[];
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalBanned(bannedList: BannedUser[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(BANNED_DATA_FILE, JSON.stringify(bannedList, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Retrieves list of all banned user profiles.
 */
export async function getBannedUsers(): Promise<BannedUser[]> {
  const supabase = getSupabase();

  if (supabase) {
    // Tier 1: Try dedicated banned_users table
    try {
      const { data, error } = await supabase.from('banned_users').select('*').order('banned_at', { ascending: false });
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: BannedUser[] = data.map((row) => ({
          email: String(row.email || '').toLowerCase().trim(),
          googleId: row.google_id ? String(row.google_id) : undefined,
          userName: String(row.user_name || 'Banned User'),
          picture: row.picture ? String(row.picture) : undefined,
          reason: row.reason ? String(row.reason) : undefined,
          bannedAt: Number(row.banned_at) || Date.now(),
          bannedBy: row.banned_by ? String(row.banned_by) : undefined,
        }));
        bannedCache = mapped;
        return mapped;
      }
    } catch {
      // ignore
    }

    // Tier 2: Try characters table __banned_users_store__ row
    try {
      const { data: storeRow, error: storeErr } = await supabase
        .from('characters')
        .select('description')
        .eq('id', BANNED_STORE_ID)
        .maybeSingle();

      if (!storeErr && storeRow && storeRow.description) {
        const parsed = JSON.parse(storeRow.description);
        if (Array.isArray(parsed)) {
          bannedCache = parsed as BannedUser[];
          return bannedCache;
        }
      }
    } catch {
      // ignore
    }
  }

  // Tier 3: Try Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-[#0067c0]', consistency: 'strong' });
    const jsonStr = await store.get('banned-users', { type: 'json' });
    if (Array.isArray(jsonStr)) {
      bannedCache = jsonStr as BannedUser[];
      return bannedCache;
    }
  } catch {
    // ignore
  }

  // Tier 4: Local storage
  if (!bannedCache) {
    bannedCache = loadLocalBanned();
  }
  return bannedCache;
}

/**
 * Checks if an email or googleId is banned.
 */
export async function isUserBanned(email?: string, googleId?: string): Promise<boolean> {
  if (!email && !googleId) return false;
  const list = await getBannedUsers();
  const cleanEmail = email ? email.toLowerCase().trim() : '';

  return list.some(
    (b) =>
      (cleanEmail && b.email.toLowerCase().trim() === cleanEmail) ||
      (googleId && b.googleId && b.googleId === googleId)
  );
}

/**
 * Bans a user profile, saves to database, and PURGES ALL their comments.
 */
export async function banUser(data: {
  email: string;
  googleId?: string;
  userName?: string;
  picture?: string;
  reason?: string;
  bannedBy?: string;
}): Promise<BannedUser> {
  const cleanEmail = data.email.toLowerCase().trim();
  const newBan: BannedUser = {
    email: cleanEmail,
    googleId: data.googleId ? data.googleId.trim() : undefined,
    userName: data.userName ? data.userName.trim() : 'Banned User',
    picture: data.picture,
    reason: data.reason || 'Violated community guidelines',
    bannedAt: Date.now(),
    bannedBy: data.bannedBy || 'Admin',
  };

  const current = await getBannedUsers();
  const updated = [newBan, ...current.filter((b) => b.email !== cleanEmail && b.googleId !== newBan.googleId)];
  bannedCache = updated;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('banned_users').upsert({
        email: cleanEmail,
        google_id: newBan.googleId || null,
        user_name: newBan.userName,
        picture: newBan.picture || null,
        reason: newBan.reason || null,
        banned_at: newBan.bannedAt,
        banned_by: newBan.bannedBy || null,
      });
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: BANNED_STORE_ID,
        name: 'System Banned Users Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updated),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-[#0067c0]', consistency: 'strong' });
    await store.setJSON('banned-users', updated);
  } catch {
    // ignore
  }

  saveLocalBanned(updated);

  // AUTOMATICALLY PURGE ALL COMMENTS BY THIS USER
  try {
    await deleteCommentsByGuest(cleanEmail);
    if (newBan.googleId) {
      await deleteCommentsByGuest(newBan.googleId);
    }
  } catch {
    // ignore
  }

  return newBan;
}

/**
 * Unbans a user profile by email or googleId.
 */
export async function unbanUser(identifier: string): Promise<boolean> {
  const cleanId = identifier.toLowerCase().trim();
  const current = await getBannedUsers();
  const updated = current.filter((b) => b.email.toLowerCase() !== cleanId && b.googleId !== identifier);
  bannedCache = updated;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('banned_users').delete().or(`email.eq.${cleanId},google_id.eq.${identifier}`);
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: BANNED_STORE_ID,
        name: 'System Banned Users Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updated),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-[#0067c0]', consistency: 'strong' });
    await store.setJSON('banned-users', updated);
  } catch {
    // ignore
  }

  saveLocalBanned(updated);
  return true;
}
