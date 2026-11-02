import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';

export interface UserProfile {
  googleId: string;
  email: string;
  name: string;
  picture: string;
  signedInAt: number;
  lastActiveAt: number;
}

const USERS_DATA_FILE = path.join(process.cwd(), 'data', 'users.json');
const USERS_STORE_ID = '__users_store__';

let usersCache: UserProfile[] | null = null;

function ensureDataDir() {
  const dir = path.dirname(USERS_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLocalUsers(): UserProfile[] {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_DATA_FILE)) {
      const content = fs.readFileSync(USERS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as UserProfile[];
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalUsers(usersList: UserProfile[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_DATA_FILE, JSON.stringify(usersList, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Gets all registered users from database.
 */
export async function getUsers(): Promise<UserProfile[]> {
  const supabase = getSupabase();

  if (supabase) {
    // Tier 1: Try dedicated users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_active_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: UserProfile[] = data.map((row) => ({
          googleId: String(row.google_id || row.googleId || ''),
          email: String(row.email || '').toLowerCase().trim(),
          name: String(row.name || row.user_name || 'User'),
          picture: String(row.picture || ''),
          signedInAt: Number(row.signed_in_at || row.signedInAt) || Date.now(),
          lastActiveAt: Number(row.last_active_at || row.lastActiveAt) || Date.now(),
        }));
        usersCache = mapped;
        return mapped;
      }
    } catch {
      // ignore
    }

    // Tier 2: Try characters table __users_store__
    try {
      const { data: storeRow, error: storeErr } = await supabase
        .from('characters')
        .select('description')
        .eq('id', USERS_STORE_ID)
        .maybeSingle();

      if (!storeErr && storeRow && storeRow.description) {
        const parsed = JSON.parse(storeRow.description);
        if (Array.isArray(parsed)) {
          usersCache = parsed as UserProfile[];
          return usersCache;
        }
      }
    } catch {
      // ignore
    }
  }

  // Tier 3: Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-[#0067c0]', consistency: 'strong' });
    const jsonStr = await store.get('registered-users', { type: 'json' });
    if (Array.isArray(jsonStr)) {
      usersCache = jsonStr as UserProfile[];
      return usersCache;
    }
  } catch {
    // ignore
  }

  // Tier 4: Local storage
  if (!usersCache) {
    usersCache = loadLocalUsers();
  }
  return usersCache;
}

/**
 * Registers or updates a SINGLE unique user profile based on email.
 */
export async function registerOrUpdateUser(user: Omit<UserProfile, 'lastActiveAt'>): Promise<UserProfile> {
  const cleanEmail = user.email.toLowerCase().trim();
  // Deterministic Google ID based on email
  const deterministicId = `google_user_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;

  const profile: UserProfile = {
    googleId: deterministicId,
    email: cleanEmail,
    name: user.name.trim() || 'Google User',
    picture: user.picture || `https://unavatar.io/${encodeURIComponent(cleanEmail)}`,
    signedInAt: user.signedInAt || Date.now(),
    lastActiveAt: Date.now(),
  };

  const current = await getUsers();
  // Filter out any previous entry with same email or googleId so there's always ONLY ONE unique user!
  const updated = [profile, ...current.filter((u) => u.email !== cleanEmail && u.googleId !== deterministicId)];
  usersCache = updated;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('users').upsert({
        google_id: profile.googleId,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
        signed_in_at: profile.signedInAt,
        last_active_at: profile.lastActiveAt,
      });
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: USERS_STORE_ID,
        name: 'System Users Store',
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
    await store.setJSON('registered-users', updated);
  } catch {
    // ignore
  }

  saveLocalUsers(updated);
  return profile;
}
