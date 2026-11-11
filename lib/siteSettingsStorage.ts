import fs from 'node:fs';
import path from 'node:path';
import { getSupabase } from '@/lib/supabase';

export interface SiteUiSettings {
  redXGlobalEnabled: boolean;
  updatedAt: number;
}

export const DEFAULT_SITE_UI_SETTINGS: SiteUiSettings = {
  redXGlobalEnabled: true,
  updatedAt: 0,
};

const SITE_SETTINGS_FILE = path.join(process.cwd(), 'data', 'site_settings.json');
const SITE_SETTINGS_STORE_ID = '__site_settings_store__';

let siteSettingsCache: SiteUiSettings | null = null;

function ensureDataDir() {
  const dir = path.dirname(SITE_SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function normalizeSiteSettings(raw: Partial<SiteUiSettings> | null | undefined): SiteUiSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_SITE_UI_SETTINGS, updatedAt: Date.now() };
  }
  return {
    redXGlobalEnabled:
      typeof raw.redXGlobalEnabled === 'boolean'
        ? raw.redXGlobalEnabled
        : DEFAULT_SITE_UI_SETTINGS.redXGlobalEnabled,
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
  };
}

function loadLocalSiteSettings(): SiteUiSettings | null {
  try {
    ensureDataDir();
    if (fs.existsSync(SITE_SETTINGS_FILE)) {
      const content = fs.readFileSync(SITE_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return normalizeSiteSettings(parsed);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function saveLocalSiteSettings(settings: SiteUiSettings) {
  try {
    ensureDataDir();
    fs.writeFileSync(SITE_SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

export async function getSiteUiSettings(): Promise<SiteUiSettings> {
  const supabase = getSupabase();

  // Tier 1: Supabase
  if (supabase) {
    try {
      const { data: storeRow, error } = await supabase
        .from('characters')
        .select('description')
        .eq('id', SITE_SETTINGS_STORE_ID)
        .maybeSingle();

      if (!error && storeRow && storeRow.description) {
        const parsed = JSON.parse(storeRow.description);
        if (parsed && typeof parsed === 'object') {
          const normalized = normalizeSiteSettings(parsed);
          siteSettingsCache = normalized;
          saveLocalSiteSettings(normalized);
          return normalized;
        }
      }
    } catch {
      // fall through
    }
  }

  // Tier 2: Netlify Blobs
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore({ name: 'heroes-database', consistency: 'strong' });
    const jsonVal = await store.get('site-settings', { type: 'json' });
    if (jsonVal && typeof jsonVal === 'object') {
      const normalized = normalizeSiteSettings(jsonVal as Partial<SiteUiSettings>);
      siteSettingsCache = normalized;
      return normalized;
    }
  } catch {
    // ignore
  }

  // Tier 3: Memory cache
  if (siteSettingsCache) {
    return siteSettingsCache;
  }

  // Tier 4: Local JSON file
  const local = loadLocalSiteSettings();
  if (local) {
    siteSettingsCache = local;
    return local;
  }

  const defaults = normalizeSiteSettings(DEFAULT_SITE_UI_SETTINGS);
  saveLocalSiteSettings(defaults);
  siteSettingsCache = defaults;
  return defaults;
}

export async function saveSiteUiSettings(
  updates: Partial<SiteUiSettings>
): Promise<SiteUiSettings> {
  const current = await getSiteUiSettings();
  const updated: SiteUiSettings = {
    redXGlobalEnabled:
      typeof updates.redXGlobalEnabled === 'boolean'
        ? updates.redXGlobalEnabled
        : current.redXGlobalEnabled,
    updatedAt: Date.now(),
  };

  siteSettingsCache = updated;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('characters').upsert({
        id: SITE_SETTINGS_STORE_ID,
        name: 'System Site UI Settings Store',
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
    await store.setJSON('site-settings', updated);
  } catch {
    // ignore
  }

  saveLocalSiteSettings(updated);
  return updated;
}
