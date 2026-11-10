import { NextRequest, NextResponse } from 'next/server';
import { getContactSettings, saveContactSettings } from '@/lib/contactSettingsStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/contact-settings
export async function GET() {
  try {
    const settings = await getContactSettings();
    return NextResponse.json(
      { success: true, settings },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load contact settings' },
      { status: 500 }
    );
  }
}

// POST /api/contact-settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gmail, facebook, whatsapp } = body || {};

    const updated = await saveContactSettings({
      gmail: typeof gmail === 'string' ? gmail : '',
      facebook: typeof facebook === 'string' ? facebook : '',
      whatsapp: typeof whatsapp === 'string' ? whatsapp : '',
    });

    return NextResponse.json(
      { success: true, settings: updated },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to save contact settings' },
      { status: 500 }
    );
  }
}

// PUT /api/contact-settings
export async function PUT(req: NextRequest) {
  return POST(req);
}
