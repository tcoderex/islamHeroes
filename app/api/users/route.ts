import { NextRequest, NextResponse } from 'next/server';
import { getUsers, registerOrUpdateUser, updateUserDisplayName } from '@/lib/usersStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    const users = await getUsers();
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const user = users.find((u) => u.email === cleanEmail);
      if (user) {
        return NextResponse.json({ success: true, user });
      }
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, users });
  } catch {
    return NextResponse.json({ success: false, users: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const cleanEmail = body.email.toLowerCase().trim();

    // If request explicitly wants to update display name with 21-day cooldown check
    if (body.updateDisplayName && body.name) {
      const result = await updateUserDisplayName(cleanEmail, body.name, Boolean(body.isAdmin));
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Display name cooldown active',
            remainingDays: result.remainingDays,
          },
          { status: 403 }
        );
      }
      return NextResponse.json({ success: true, user: result.user });
    }

    // Regular sign in / profile sync
    const registered = await registerOrUpdateUser({
      googleId: body.googleId || '',
      email: cleanEmail,
      name: body.name || 'Google User',
      picture: body.picture || '',
      signedInAt: body.signedInAt || Date.now(),
      lastDisplayNameChangeAt: body.lastDisplayNameChangeAt,
    });

    return NextResponse.json({ success: true, user: registered });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to register or update user' },
      { status: 500 }
    );
  }
}
