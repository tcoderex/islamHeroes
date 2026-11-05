import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';
import { AZHAR_SCHOLARS_TEMPLATE, getAzharScholarComments } from './azhar-scholars-template';

export interface CharacterComment {
  id: string;
  characterId: string;
  userName: string;
  userEmail?: string; // Google Email
  text: string;
  guestId?: string; // Persistent browser guest identifier
  suggestedRating?: number; // -1000 to 1000
  createdAt: number;
}

const COMMENTS_DATA_FILE = path.join(process.cwd(), 'data', 'comments.json');
const COMMENTS_STORE_ID = '__comments_store__';

// In-memory cache
let commentsCache: CharacterComment[] | null = null;

function ensureDataDir() {
  const dir = path.dirname(COMMENTS_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadLocalComments(): CharacterComment[] {
  try {
    ensureDataDir();
    if (fs.existsSync(COMMENTS_DATA_FILE)) {
      const content = fs.readFileSync(COMMENTS_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as CharacterComment[];
      }
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalComments(comments: CharacterComment[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(COMMENTS_DATA_FILE, JSON.stringify(comments, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Retrieves comments with multi-tier Supabase storage and local fallback:
 * 1. Supabase public.character_comments table
 * 2. Supabase public.characters table (__comments_store__ row fallback)
 * 3. Netlify Blobs store
 * 4. Local server JSON persistence file (data/comments.json)
 */
export async function getComments(characterId?: string): Promise<CharacterComment[]> {
  const supabase = getSupabase();

  if (supabase) {
    // Tier 1: Try dedicated character_comments table
    try {
      let query = supabase.from('character_comments').select('*').order('created_at', { ascending: false });
      if (characterId) {
        query = query.eq('character_id', characterId);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: CharacterComment[] = data.map((row) => ({
          id: String(row.id),
          characterId: String(row.character_id),
          userName: String(row.user_name || 'Guest'),
          userEmail: row.user_email ? String(row.user_email) : row.userEmail ? String(row.userEmail) : undefined,
          text: String(row.text || ''),
          guestId: row.guest_id ? String(row.guest_id) : row.guestId ? String(row.guestId) : undefined,
          suggestedRating:
            row.suggested_rating !== null && row.suggested_rating !== undefined
              ? Number(row.suggested_rating)
              : undefined,
          createdAt: Number(row.created_at) || Date.now(),
        }));
        commentsCache = mapped;
        return mapped;
      }
    } catch {
      // Table missing or schema error, fall through to fallback store row
    }

    // Tier 2: Try __comments_store__ row in characters table
    try {
      const { data: storeRow, error: storeErr } = await supabase
        .from('characters')
        .select('description')
        .eq('id', COMMENTS_STORE_ID)
        .maybeSingle();

      if (!storeErr && storeRow && storeRow.description) {
        const parsed = JSON.parse(storeRow.description);
        if (Array.isArray(parsed)) {
          commentsCache = parsed as CharacterComment[];
          if (characterId) {
            return commentsCache.filter((c) => c.characterId === characterId);
          }
          return commentsCache;
        }
      }
    } catch {
      // Fall through to Netlify / Local
    }
  }

  // Tier 3: Try Netlify Blobs if in Netlify runtime
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    const jsonStr = await store.get('all-comments', { type: 'json' });
    if (Array.isArray(jsonStr)) {
      commentsCache = jsonStr as CharacterComment[];
      if (characterId) {
        return commentsCache.filter((c) => c.characterId === characterId);
      }
      return commentsCache;
    }
  } catch {
    // fallback
  }

  // Tier 4: Local memory cache & disk storage fallback
  if (!commentsCache) {
    commentsCache = loadLocalComments();
  }

  // Auto-seed Azhar scholars 3+ Arabic fake user negative comments (< 0) if missing
  commentsCache = ensureAzharSeedComments(commentsCache, characterId);

  if (characterId) {
    return commentsCache.filter((c) => c.characterId === characterId);
  }
  return commentsCache;
}

function ensureAzharSeedComments(existingComments: CharacterComment[], requestedCharacterId?: string): CharacterComment[] {
  const list = [...existingComments];
  const existingCharIds = new Set(list.map((c) => c.characterId));

  // 1. Seed for all 10 default template scholars if missing
  AZHAR_SCHOLARS_TEMPLATE.forEach((scholar) => {
    if (!existingCharIds.has(scholar.id)) {
      const seeds = getAzharScholarComments(scholar.id, scholar.name);
      seeds.forEach((s, idx) => {
        list.push({
          id: `azhar-seed-${scholar.id}-${idx + 1}`,
          characterId: scholar.id,
          userName: s.userName,
          text: s.text,
          suggestedRating: s.suggestedRating,
          createdAt: Date.now() - 1000 * 60 * 60 * (idx + 1) * 3,
        });
      });
      existingCharIds.add(scholar.id);
    }
  });

  // 2. Also seed for specific requested characterId if it starts with azhar- or has no comments
  if (requestedCharacterId && !existingCharIds.has(requestedCharacterId) && requestedCharacterId.includes('azhar')) {
    const seeds = getAzharScholarComments(requestedCharacterId);
    seeds.forEach((s, idx) => {
      list.push({
        id: `azhar-seed-${requestedCharacterId}-${idx + 1}`,
        characterId: requestedCharacterId,
        userName: s.userName,
        text: s.text,
        suggestedRating: s.suggestedRating,
        createdAt: Date.now() - 1000 * 60 * 60 * (idx + 1) * 3,
      });
    });
  }

  return list;
}

/**
 * Adds a new comment and persists it immediately to Supabase and local backup.
 */
export async function addComment(
  commentData: Omit<CharacterComment, 'id' | 'createdAt'>
): Promise<CharacterComment> {
  const newComment: CharacterComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    characterId: commentData.characterId,
    userName: commentData.userName.trim() || 'Guest',
    userEmail: commentData.userEmail ? commentData.userEmail.trim().toLowerCase() : undefined,
    text: commentData.text.trim(),
    guestId: commentData.guestId ? commentData.guestId.trim() : undefined,
    suggestedRating:
      commentData.suggestedRating !== undefined
        ? Math.max(-1000, Math.min(1000, Number(commentData.suggestedRating)))
        : undefined,
    createdAt: Date.now(),
  };

  const currentComments = await getComments();
  const updatedComments = [newComment, ...currentComments.filter((c) => c.id !== newComment.id)];
  commentsCache = updatedComments;

  const supabase = getSupabase();
  if (supabase) {
    // 1. Try dedicated table insert
    try {
      await supabase.from('character_comments').insert({
        id: newComment.id,
        character_id: newComment.characterId,
        user_name: newComment.userName,
        text: newComment.text,
        guest_id: newComment.guestId || null,
        suggested_rating: newComment.suggestedRating !== undefined ? newComment.suggestedRating : null,
        created_at: newComment.createdAt,
      });
    } catch {
      // ignore
    }

    // 2. Always persist to characters table __comments_store__ row as guaranteed Supabase backup
    try {
      await supabase.from('characters').upsert({
        id: COMMENTS_STORE_ID,
        name: 'System Comments Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updatedComments),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  // 3. Save to Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updatedComments);
  } catch {
    // ignore
  }

  // 4. Save to local disk
  saveLocalComments(updatedComments);

  return newComment;
}

/**
 * Deletes a single comment by ID (Admin only) and syncs across Supabase and backups.
 */
export async function deleteComment(id: string): Promise<boolean> {
  const currentComments = await getComments();
  const updatedComments = currentComments.filter((c) => c.id !== id);
  commentsCache = updatedComments;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('character_comments').delete().eq('id', id);
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: COMMENTS_STORE_ID,
        name: 'System Comments Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updatedComments),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updatedComments);
  } catch {
    // ignore
  }

  saveLocalComments(updatedComments);
  return true;
}

/**
 * Deletes ALL comments by a specific guestId or userName (Admin Ban / Wipe user).
 */
export async function deleteCommentsByGuest(guestIdentifier: string): Promise<boolean> {
  const currentComments = await getComments();
  const updatedComments = currentComments.filter(
    (c) => c.guestId !== guestIdentifier && c.userName !== guestIdentifier
  );
  commentsCache = updatedComments;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('character_comments').delete().or(`guest_id.eq.${guestIdentifier},user_name.eq.${guestIdentifier}`);
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: COMMENTS_STORE_ID,
        name: 'System Comments Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updatedComments),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updatedComments);
  } catch {
    // ignore
  }

  saveLocalComments(updatedComments);
  return true;
}

/**
 * Deletes ALL comments for a specific user by email (Admin Purge user messages).
 */
export async function deleteCommentsByUserEmail(
  userEmail: string,
  guestId?: string,
  userName?: string
): Promise<boolean> {
  const cleanEmail = userEmail.trim().toLowerCase();
  const currentComments = await getComments();
  const updatedComments = currentComments.filter(
    (c) =>
      c.userEmail?.toLowerCase() !== cleanEmail &&
      (!guestId || c.guestId !== guestId) &&
      (!userName || c.userName !== userName)
  );
  commentsCache = updatedComments;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('character_comments').delete().or(`user_email.eq.${cleanEmail},userEmail.eq.${cleanEmail}`);
    } catch {
      // ignore
    }

    try {
      await supabase.from('characters').upsert({
        id: COMMENTS_STORE_ID,
        name: 'System Comments Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updatedComments),
        updated_at: Date.now(),
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updatedComments);
  } catch {
    // ignore
  }

  saveLocalComments(updatedComments);
  return true;
}
