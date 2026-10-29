import { NextRequest, NextResponse } from 'next/server';
import {
  getSharedCharacters,
  saveSharedCharacters,
  deleteSharedCharacter,
  getDatabaseStatus,
  SharedCharacter,
} from '@/lib/sharedStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/characters - Retrieve shared list of characters dynamically with DB status
export async function GET() {
  try {
    const [characters, dbStatus] = await Promise.all([
      getSharedCharacters(),
      getDatabaseStatus(),
    ]);

    return NextResponse.json(
      {
        success: true,
        characters,
        dbStatus,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch characters' },
      { status: 500 }
    );
  }
}

// POST /api/characters - Add new character or Bulk replace/import
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await getSharedCharacters();

    // Case 1: Bulk replace or array update
    if (Array.isArray(body.characters)) {
      const updatedList: SharedCharacter[] = body.characters.map((item: SharedCharacter, index: number) => ({
        id: item.id || `char-${Date.now()}-${index}`,
        name: item.name,
        picture: item.picture || '',
        rating: Math.max(-1000, Math.min(1000, Number(item.rating) || 0)),
        description: item.description,
        updatedAt: Date.now(),
      }));

      await saveSharedCharacters(updatedList);
      return NextResponse.json(
        { success: true, characters: updatedList },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Case 2: Single character addition
    const { name, picture, rating, description } = body;
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const newChar: SharedCharacter = {
      id: `char-${Date.now()}`,
      name: name.trim(),
      picture: typeof picture === 'string' ? picture.trim() : '',
      rating: Math.max(-1000, Math.min(1000, Number(rating) || 0)),
      description: typeof description === 'string' ? description.trim() : undefined,
      updatedAt: Date.now(),
    };

    const updated = [newChar, ...current];
    await saveSharedCharacters(updated);

    return NextResponse.json(
      { success: true, character: newChar, characters: updated },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save character' },
      { status: 500 }
    );
  }
}

// PUT /api/characters - Update existing character
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, picture, rating, description } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Character ID is required' }, { status: 400 });
    }

    const current = await getSharedCharacters();
    const index = current.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 });
    }

    const updatedChar: SharedCharacter = {
      ...current[index],
      name: typeof name === 'string' ? name.trim() : current[index].name,
      picture: typeof picture === 'string' ? picture.trim() : current[index].picture,
      rating: rating !== undefined ? Math.max(-1000, Math.min(1000, Number(rating))) : current[index].rating,
      description: typeof description === 'string' ? description.trim() : current[index].description,
      updatedAt: Date.now(),
    };

    const updatedList = [...current];
    updatedList[index] = updatedChar;

    await saveSharedCharacters(updatedList);

    return NextResponse.json(
      { success: true, character: updatedChar, characters: updatedList },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

// DELETE /api/characters - Delete character by ID
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Character ID parameter is required' }, { status: 400 });
    }

    await deleteSharedCharacter(id);
    const current = await getSharedCharacters();

    return NextResponse.json(
      { success: true, characters: current },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}
