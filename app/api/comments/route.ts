import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment, deleteComment } from '@/lib/commentsStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/comments?characterId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId') || undefined;

    const comments = await getComments(characterId);

    // Compute stats if characterId is provided
    let count = comments.length;
    let avgSuggestedRating: number | null = null;

    if (characterId && comments.length > 0) {
      const withRating = comments.filter((c) => c.suggestedRating !== undefined);
      if (withRating.length > 0) {
        const sum = withRating.reduce((acc, c) => acc + (c.suggestedRating || 0), 0);
        avgSuggestedRating = Math.round(sum / withRating.length);
      }
    }

    // Also build a counts map of characterId -> count for convenient UI badge display
    const countsMap: Record<string, number> = {};
    if (!characterId) {
      comments.forEach((c) => {
        countsMap[c.characterId] = (countsMap[c.characterId] || 0) + 1;
      });
    }

    return NextResponse.json(
      {
        success: true,
        comments,
        count,
        avgSuggestedRating,
        countsMap,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Add user comment and rating suggestion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, userName, text, suggestedRating } = body;

    if (!characterId || typeof characterId !== 'string') {
      return NextResponse.json({ success: false, error: 'Character ID is required' }, { status: 400 });
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Comment text is required' }, { status: 400 });
    }

    const newComment = await addComment({
      characterId,
      userName: typeof userName === 'string' && userName.trim() ? userName.trim() : 'Guest',
      text: text.trim(),
      suggestedRating: suggestedRating !== undefined && suggestedRating !== null ? Number(suggestedRating) : undefined,
    });

    return NextResponse.json(
      { success: true, comment: newComment },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?id=... - Admin delete inappropriate comment
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Comment ID is required' }, { status: 400 });
    }

    await deleteComment(id);

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
