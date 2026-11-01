import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';

export interface CharacterComment {
  id: string;
  characterId: string;
  userName: string;
  text: string;
  suggestedRating?: number; // -1000 to 1000
  createdAt: number;
}

const COMMENTS_DATA_FILE = path.join(process.cwd(), 'data', 'comments.json');

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
 * Retrieves comments, with Supabase integration and local fallback.
 */
export async function getComments(characterId?: string): Promise<CharacterComment[]> {
  // 1. Try Supabase table if available
  const supabase = getSupabase();
  if (supabase) {
    try {
      let query = supabase.from('character_comments').select('*').order('created_at', { ascending: false });
      if (characterId) {
        query = query.eq('character_id', characterId);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const mapped: CharacterComment[] = data.map((row) => ({
          id: String(row.id),
          characterId: String(row.character_id),
          userName: String(row.user_name || 'Guest'),
          text: String(row.text || ''),
          suggestedRating: row.suggested_rating !== null && row.suggested_rating !== undefined ? Number(row.suggested_rating) : undefined,
          createdAt: Number(row.created_at) || Date.now(),
        }));
        return mapped;
      }
    } catch {
      // Table doesn't exist or offline, fallback to local store
    }
  }

  // 2. Try Netlify Blobs if in Netlify runtime
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

  // 3. In-memory / local JSON store fallback
  if (!commentsCache) {
    commentsCache = loadLocalComments();
  }

  if (characterId) {
    return commentsCache.filter((c) => c.characterId === characterId);
  }
  return commentsCache;
}

/**
 * Adds a new comment and persists it to Supabase and local backup.
 */
export async function addComment(commentData: Omit<CharacterComment, 'id' | 'createdAt'>): Promise<CharacterComment> {
  const newComment: CharacterComment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    characterId: commentData.characterId,
    userName: commentData.userName.trim() || 'Guest',
    text: commentData.text.trim(),
    suggestedRating:
      commentData.suggestedRating !== undefined
        ? Math.max(-1000, Math.min(1000, Number(commentData.suggestedRating)))
        : undefined,
    createdAt: Date.now(),
  };

  // 1. Try Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('character_comments').insert({
        id: newComment.id,
        character_id: newComment.characterId,
        user_name: newComment.userName,
        text: newComment.text,
        suggested_rating: newComment.suggestedRating !== undefined ? newComment.suggestedRating : null,
        created_at: newComment.createdAt,
      });
    } catch {
      // ignore table missing
    }
  }

  // 2. Update local and memory cache
  const all = await getComments();
  const updated = [newComment, ...all.filter((c) => c.id !== newComment.id)];
  commentsCache = updated;
  saveLocalComments(updated);

  // 3. Try Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updated);
  } catch {
    // ignore
  }

  return newComment;
}

/**
 * Deletes a comment by ID (Admin only).
 */
export async function deleteComment(id: string): Promise<boolean> {
  // 1. Try Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('character_comments').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  // 2. Update local store
  const all = await getComments();
  const updated = all.filter((c) => c.id !== id);
  commentsCache = updated;
  saveLocalComments(updated);

  // 3. Try Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-comments', consistency: 'strong' });
    await store.setJSON('all-comments', updated);
  } catch {
    // ignore
  }

  return true;
}
