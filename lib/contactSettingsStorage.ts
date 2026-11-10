import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';
import { ContactSettings, DEFAULT_CONTACT_SETTINGS } from './contactSettingsTypes';

const CONTACT_SETTINGS_FILE = path.join(process.cwd(), 'data', 'contact_settings.json');
const CONTACT_STORE_ID = '__contact_settings_store__';

let contactSettingsCache: ContactSettings | null = null;

function ensureDataDir() {
  const dir = path.dirname(CONTACT_SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeSettings(raw: Partial<ContactSettings> | null | undefined): ContactSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CONTACT_SETTINGS };
  }
  return {
    gmail: typeof raw.gmail === 'string' ? raw.gmail.trim() : DEFAULT_CONTACT_SETTINGS.gmail,
    facebook: typeof raw.facebook === 'string' ? raw.facebook.trim() : DEFAULT_CONTACT_SETTINGS.facebook,
    whatsapp: typeof raw.whatsapp === 'string' ? raw.whatsapp.trim() : DEFAULT_CONTACT_SETTINGS.whatsapp,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

function loadLocalContactSettings(): ContactSettings | null {
  try {
    ensureDataDir();
    if (fs.existsSync(CONTACT_SETTINGS_FILE)) {
      const content = fs.readFileSync(CONTACT_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return normalizeSettings(parsed);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveLocalContactSettings(settings: ContactSettings) {
  try {
    ensureDataDir();
    fs.writeFileSync(CONTACT_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Retrieves contact settings across Supabase, Netlify Blobs, memory, and local disk.
 */
export async function getContactSettings(): Promise<ContactSettings> {
  const supabase = getSupabase();

  // Tier 1: Supabase characters table (__contact_settings_store__ row)
  if (supabase) {
    try {
      const { data: storeRow, error: storeErr } = await supabase
        .from('characters')
        .select('description, updated_at')
        .eq('id', CONTACT_STORE_ID)
        .maybeSingle();

      if (!storeErr && storeRow && storeRow.description) {
        const parsed = JSON.parse(storeRow.description);
        if (parsed && typeof parsed === 'object') {
          const normalized = normalizeSettings(parsed);
          contactSettingsCache = normalized;
          saveLocalContactSettings(normalized);
          return normalized;
        }
      }
    } catch {
      // Fall through to Netlify Blobs / local
    }
  }

  // Tier 2: Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-database', consistency: 'strong' });
    const jsonVal = await store.get('contact-settings', { type: 'json' });
    if (jsonVal && typeof jsonVal === 'object') {
      const normalized = normalizeSettings(jsonVal as Partial<ContactSettings>);
      contactSettingsCache = normalized;
      return normalized;
    }
  } catch {
    // ignore
  }

  // Tier 3: Memory cache
  if (contactSettingsCache) {
    return contactSettingsCache;
  }

  // Tier 4: Local disk file
  const local = loadLocalContactSettings();
  if (local) {
    contactSettingsCache = local;
    return local;
  }

  // Default seed
  const defaults = { ...DEFAULT_CONTACT_SETTINGS };
  saveLocalContactSettings(defaults);
  contactSettingsCache = defaults;
  return defaults;
}

/**
 * Persists edited contact settings (Gmail, Facebook, WhatsApp) to Supabase, Netlify Blobs, and local disk.
 */
export async function saveContactSettings(
  updates: Partial<ContactSettings>
): Promise<ContactSettings> {
  const updated: ContactSettings = {
    gmail: typeof updates.gmail === 'string' ? updates.gmail.trim() : DEFAULT_CONTACT_SETTINGS.gmail,
    facebook: typeof updates.facebook === 'string' ? updates.facebook.trim() : DEFAULT_CONTACT_SETTINGS.facebook,
    whatsapp: typeof updates.whatsapp === 'string' ? updates.whatsapp.trim() : '',
    updatedAt: Date.now(),
  };

  contactSettingsCache = updated;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('characters').upsert({
        id: CONTACT_STORE_ID,
        name: 'System Contact Settings Store',
        picture: '',
        rating: 0,
        description: JSON.stringify(updated),
        updated_at: updated.updatedAt,
      });
    } catch {
      // ignore
    }
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-database', consistency: 'strong' });
    await store.setJSON('contact-settings', updated);
  } catch {
    // ignore
  }

  saveLocalContactSettings(updated);
  return updated;
}
