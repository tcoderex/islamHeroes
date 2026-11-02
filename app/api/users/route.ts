import { NextRequest, NextResponse } from 'next/server';
import { getUsers, registerOrUpdateUser } from '@/lib/usersStorage';

export async function GET() {
  try {
    const users = await getUsers();
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

    const registered = await registerOrUpdateUser({
      googleId: body.googleId || '',
      email: body.email,
      name: body.name || 'Google User',
      picture: body.picture || '',
      signedInAt: body.signedInAt || Date.now(),
    });

    return NextResponse.json({ success: true, user: registered });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
