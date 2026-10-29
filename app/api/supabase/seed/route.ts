import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, SUPABASE_URL } from '@/lib/supabase';
import { DEFAULT_CHARACTERS, CharacterData } from '@/lib/defaultCharacters';
import { getSharedCharacters } from '@/lib/sharedStorage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({
      success: false,
      error: 'Supabase client could not be initialized.',
    }, { status: 400 });
  }

  try {
    let charactersToSync: CharacterData[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body.characters) && body.characters.length > 0) {
        charactersToSync = body.characters;
      }
    } catch {
      // body empty or not json
    }

    if (charactersToSync.length === 0) {
      const existing = await getSharedCharacters();
      // If only 1 or empty, include full default 10 characters
      if (existing.length <= 1) {
        charactersToSync = DEFAULT_CHARACTERS;
      } else {
        charactersToSync = existing;
      }
    }

    const payload = charactersToSync.map((c) => ({
      id: c.id,
      name: c.name,
      picture: c.picture || '',
      rating: c.rating,
      description: c.description || null,
      updated_at: c.updatedAt || Date.now(),
    }));

    const { error } = await supabase.from('characters').upsert(payload, { onConflict: 'id' });

    if (error) {
      if (error.code === 'PGRST205') {
        return NextResponse.json({
          success: false,
          tableMissing: true,
          error: "Table 'public.characters' does not exist yet.",
          sql: `CREATE TABLE IF NOT EXISTS public.characters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  picture TEXT DEFAULT '',
  rating NUMERIC DEFAULT 0,
  description TEXT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Public Insert" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Public Delete" ON public.characters FOR DELETE USING (true);`,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${charactersToSync.length} characters to Supabase!`,
      count: charactersToSync.length,
      url: SUPABASE_URL,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      error: message,
    }, { status: 500 });
  }
}
