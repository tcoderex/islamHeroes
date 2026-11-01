import { NextRequest, NextResponse } from 'next/server';
import { getBannedUsers, banUser, unbanUser, isUserBanned } from '@/lib/bannedUsersStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/banned-users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const googleId = searchParams.get('googleId') || undefined;

    if (email || googleId) {
      const banned = await isUserBanned(email, googleId);
      return NextResponse.json({ success: true, isBanned: banned });
    }

    const bannedUsers = await getBannedUsers();
    return NextResponse.json(
      { success: true, bannedUsers, count: bannedUsers.length },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve banned users list' },
      { status: 500 }
    );
  }
}

// POST /api/banned-users - Ban user profile and purge all their comments
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, googleId, userName, picture, reason, bannedBy } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ success: false, error: 'User email is required to ban' }, { status: 400 });
    }

    const newBan = await banUser({
      email: email.trim(),
      googleId: typeof googleId === 'string' ? googleId.trim() : undefined,
      userName: typeof userName === 'string' ? userName.trim() : undefined,
      picture: typeof picture === 'string' ? picture : undefined,
      reason: typeof reason === 'string' ? reason.trim() : undefined,
      bannedBy: typeof bannedBy === 'string' ? bannedBy.trim() : 'Admin',
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully banned user ${newBan.email} and purged all their comments!`,
        bannedUser: newBan,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

// DELETE /api/banned-users?email=... - Unban user profile
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const googleId = searchParams.get('googleId');

    const identifier = email || googleId;
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Email or Google ID parameter is required' },
        { status: 400 }
      );
    }

    await unbanUser(identifier);

    return NextResponse.json(
      { success: true, message: `Successfully unbanned user ${identifier}` },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}
