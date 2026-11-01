import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment, deleteComment, deleteCommentsByGuest } from '@/lib/commentsStorage';
import { isUserBanned } from '@/lib/bannedUsersStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/comments?characterId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get('characterId') || undefined;

    const comments = await getComments(characterId);

    let count = comments.length;
    let avgSuggestedRating: number | null = null;

    if (characterId && comments.length > 0) {
      const withRating = comments.filter((c) => c.suggestedRating !== undefined);
      if (withRating.length > 0) {
        const sum = withRating.reduce((acc, c) => acc + (c.suggestedRating || 0), 0);
        avgSuggestedRating = Math.round(sum / withRating.length);
      }
    }

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
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Add user comment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterId, userName, userEmail, text, guestId, suggestedRating } = body;

    if (!characterId || typeof characterId !== 'string') {
      return NextResponse.json({ success: false, error: 'Character ID is required' }, { status: 400 });
    }

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Comment text is required' }, { status: 400 });
    }

    // Check if user account or guest ID is banned
    const emailToTest = typeof userEmail === 'string' ? userEmail.trim().toLowerCase() : undefined;
    const guestToTest = typeof guestId === 'string' ? guestId.trim() : undefined;

    const banned = await isUserBanned(emailToTest, guestToTest);
    if (banned) {
      return NextResponse.json(
        { success: false, error: 'حسابك محظور من إضافة التعليقات. تواصل مع الإدارة' },
        { status: 403 }
      );
    }

    const newComment = await addComment({
      characterId,
      userName: typeof userName === 'string' && userName.trim() ? userName.trim() : 'Guest',
      userEmail: emailToTest,
      text: text.trim(),
      guestId: guestToTest,
      suggestedRating: suggestedRating !== undefined && suggestedRating !== null ? Number(suggestedRating) : undefined,
    });

    return NextResponse.json(
      { success: true, comment: newComment },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/comments?id=... or ?guestId=... - Admin delete
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const guestId = searchParams.get('guestId');

    if (guestId) {
      await deleteCommentsByGuest(guestId);
      return NextResponse.json(
        { success: true, message: 'Successfully deleted all comments by guest' },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    if (id) {
      await deleteComment(id);
      return NextResponse.json(
        { success: true, message: 'Successfully deleted comment' },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Comment ID or Guest ID parameter is required' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment(s)' },
      { status: 500 }
    );
  }
}
