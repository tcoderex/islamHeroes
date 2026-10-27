import fs from 'node:fs';
import path from 'node:path';

export interface SharedCharacter {
  id: string;
  name: string;
  picture: string;
  rating: number; // -1000 to 1000
  description?: string;
  updatedAt?: number;
}

const DEFAULT_CHARACTERS: SharedCharacter[] = [
  {
    id: 'char-1',
    name: 'Khalid ibn al-Walid',
    picture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    rating: 1000,
    description: 'Sayf Allah al-Maslul (The Drawn Sword of Allah)',
    updatedAt: 1700000000000,
  },
  {
    id: 'char-2',
    name: 'Salahuddin al-Ayyubi',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    rating: 980,
    description: 'The Liberator of Jerusalem',
    updatedAt: 1700000000000,
  },
  {
    id: 'char-3',
    name: 'Umar ibn al-Khattab',
    picture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    rating: 990,
    description: 'Al-Faruq (The Distinguisher of Truth)',
    updatedAt: 1700000000000,
  },
  {
    id: 'char-4',
    name: 'Tariq ibn Ziyad',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    rating: 950,
    description: 'Conqueror of Hispania and commander of the Strait of Gibraltar',
    updatedAt: 1700000000000,
  },
];

const LOCAL_DATA_FILE = path.join(process.cwd(), 'data', 'characters.json');

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

// Ensure data directory exists for local persistence
function ensureLocalDataDir() {
  const dir = path.dirname(LOCAL_DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Gets shared characters list from Netlify Blobs (if on Netlify) or local server file persistence.
 * Automatically seeds Netlify Blobs if empty.
 */
export async function getSharedCharacters(): Promise<SharedCharacter[]> {
  const seed = getInitialSeedCharacters();

  // 1. Try Netlify Blobs if in Netlify runtime
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('heroes-database');
      const jsonStr = await store.get('characters', { type: 'json' });
      if (Array.isArray(jsonStr) && jsonStr.length > 0) {
        return jsonStr as SharedCharacter[];
      }
      // Auto-seed Netlify Blobs with committed seed
      await store.setJSON('characters', seed);
      return seed;
    } catch {
      // Fallback to local file store if Netlify Blob store isn't bound yet
    }
  }

  // 2. Local Server JSON File Store
  ensureLocalDataDir();
  if (fs.existsSync(LOCAL_DATA_FILE)) {
    try {
      const content = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as SharedCharacter[];
      }
    } catch {
      // ignore
    }
  }

  // Initial seed write to local store
  saveLocalCharacters(seed);
  return seed;
}

/**
 * Saves shared characters list to Netlify Blobs and local server persistence.
 */
export async function saveSharedCharacters(characters: SharedCharacter[]): Promise<boolean> {
  let savedToNetlify = false;

  // 1. Save to Netlify Blobs if running on Netlify
  if (process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT) {
    try {
      const { getStore } = await import('@netlify/blobs');
      const store = getStore('heroes-database');
      await store.setJSON('characters', characters);
      savedToNetlify = true;
    } catch {
      // Fallback to file store
    }
  }

  // 2. Always persist to local file store as well
  saveLocalCharacters(characters);
  return savedToNetlify || true;
}

function saveLocalCharacters(characters: SharedCharacter[]) {
  try {
    ensureLocalDataDir();
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(characters, null, 2), 'utf-8');
  } catch {
    // ignore filesystem errors in read-only environments
  }
}
