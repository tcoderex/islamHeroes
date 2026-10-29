import fs from 'node:fs';
import path from 'node:path';
import { getSupabase, SUPABASE_URL } from '@/lib/supabase';
import { DEFAULT_CHARACTERS, CharacterData } from './defaultCharacters';

export type SharedCharacter = CharacterData;


const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'characters.json');

// In-memory fallback cache for serverless environments
let memoryCache: SharedCharacter[] | null = null;

// Reads local seed file if present, else DEFAULT_CHARACTERS
function getInitialSeedCharacters(): SharedCharacter[] {
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as SharedCharacter[];
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CHARACTERS;
}

function ensureLocalDataDir() {
  const dir = path.dirname(LOCAL_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Gets shared characters list with multi-tier storage priority:
 * 1. Supabase (PostgreSQL characters table)
 * 2. Netlify Blobs (if on Netlify)
 * 3. Local/Server file persistence (data/characters.json)
 */
export async function getSharedCharacters(): Promise<SharedCharacter[]> {
  const seed = getInitialSeedCharacters();

  // 1. Try Supabase Database first
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('rating', { ascending: false });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const mapped: SharedCharacter[] = data.map((row) => ({
            id: String(row.id),
            name: String(row.name || ''),
            picture: String(row.picture || ''),
            rating: Number(row.rating) || 0,
            description: row.description ? String(row.description) : undefined,
            updatedAt: row.updated_at ? Number(row.updated_at) : Date.now(),
          }));
          memoryCache = mapped;
          return mapped;
        } else {
          // Auto-seed Supabase characters table with seed data
          const payload = seed.map((c) => ({
            id: c.id,
            name: c.name,
            picture: c.picture || '',
            rating: c.rating,
            description: c.description || null,
            updated_at: c.updatedAt || Date.now(),
          }));
          await supabase.from('characters').upsert(payload, { onConflict: 'id' });
          memoryCache = seed;
          return seed;
        }
      }
    } catch {
      // Supabase table may not exist yet or connection error; fall through to next tier
    }
  }

  // 2. Try Netlify Blobs if in Netlify runtime
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-database', consistency: 'strong' });
    const jsonStr = await store.get('characters', { type: 'json' });
    if (Array.isArray(jsonStr) && jsonStr.length > 0) {
      memoryCache = jsonStr as SharedCharacter[];
      return memoryCache;
    }
    // Auto-seed Netlify Blobs with committed seed
    await store.setJSON('characters', seed);
    memoryCache = seed;
    return seed;
  } catch {
    // Fallback if not on Netlify or Netlify Blobs credentials not injected yet
  }

  // 3. In-memory cache fallback
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  // 4. Local Server JSON File Store
  ensureLocalDataDir();
  if (fs.existsSync(LOCAL_DATA_FILE)) {
    try {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed as SharedCharacter[];
        return memoryCache;
      }
    } catch {
      // ignore
    }
  }

  // Initial seed write to local store
  saveLocalCharacters(seed);
  memoryCache = seed;
  return seed;
}

/**
 * Saves shared characters list to Supabase, Netlify Blobs, and local server persistence.
 */
export async function saveSharedCharacters(characters: SharedCharacter[]): Promise<boolean> {
  memoryCache = characters;
  let savedToSupabase = false;

  // 1. Save to Supabase if configured
  const supabase = getSupabase();
  if (supabase) {
    try {
      const payload = characters.map((c) => ({
        id: c.id,
        name: c.name,
        picture: c.picture || '',
        rating: c.rating,
        description: c.description || null,
        updated_at: c.updatedAt || Date.now(),
      }));

      const { error } = await supabase.from('characters').upsert(payload, { onConflict: 'id' });
      if (!error) {
        savedToSupabase = true;
      }
    } catch {
      // Ignore if table not yet created
    }
  }

  // 2. Save to Netlify Blobs if running on Netlify
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-database', consistency: 'strong' });
    await store.setJSON('characters', characters);
  } catch {
    // Fallback to file store
  }

  // 3. Always persist to local file store as well
  saveLocalCharacters(characters);
  return savedToSupabase || true;
}

/**
 * Deletes a character from Supabase, Netlify Blobs, and local store.
 */
export async function deleteSharedCharacter(id: string): Promise<boolean> {
  const current = await getSharedCharacters();
  const updated = current.filter((c) => c.id !== id);
  memoryCache = updated;

  // Delete from Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('characters').delete().eq('id', id);
    } catch {
      // ignore
    }
  }

  // Save updated list to Netlify Blobs and local
  await saveSharedCharacters(updated);
  return true;
}

/**
 * Checks connectivity and readiness of the Supabase database.
 */
export async function getDatabaseStatus(): Promise<{
  provider: 'supabase' | 'netlify-blobs' | 'local';
  supabaseConnected: boolean;
  supabaseTableReady: boolean;
  supabaseError?: string;
  url: string;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      provider: 'local',
      supabaseConnected: false,
      supabaseTableReady: false,
      supabaseError: 'Supabase credentials not configured',
      url: SUPABASE_URL,
    };
  }

  try {
    const { error } = await supabase.from('characters').select('id').limit(1);
    if (!error) {
      return {
        provider: 'supabase',
        supabaseConnected: true,
        supabaseTableReady: true,
        url: SUPABASE_URL,
      };
    }

    if (error.code === 'PGRST205') {
      return {
        provider: process.env.NETLIFY ? 'netlify-blobs' : 'local',
        supabaseConnected: true,
        supabaseTableReady: false,
        supabaseError: "Table 'public.characters' does not exist yet in your Supabase project.",
        url: SUPABASE_URL,
      };
    }

    return {
      provider: process.env.NETLIFY ? 'netlify-blobs' : 'local',
      supabaseConnected: true,
      supabaseTableReady: false,
      supabaseError: error.message,
      url: SUPABASE_URL,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Connection failed';
    return {
      provider: 'local',
      supabaseConnected: false,
      supabaseTableReady: false,
      supabaseError: errorMessage,
      url: SUPABASE_URL,
    };
  }
}

function saveLocalCharacters(characters: SharedCharacter[]) {
  try {
    ensureLocalDataDir();
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
  } catch {
    // ignore filesystem errors in read-only environments
  }
}
