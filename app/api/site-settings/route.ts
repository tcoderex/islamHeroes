import { NextRequest, NextResponse } from 'next/server';
import { getSiteUiSettings, saveSiteUiSettings } from '@/lib/siteSettingsStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/site-settings
export async function GET() {
  try {
    const settings = await getSiteUiSettings();
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
      { success: false, error: 'Failed to load site settings' },
      { status: 500 }
    );
  }
}

// POST /api/site-settings
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { redXGlobalEnabled } = body || {};

    const updated = await saveSiteUiSettings({
      ...(typeof redXGlobalEnabled === 'boolean' ? { redXGlobalEnabled } : {}),
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
      { success: false, error: 'Failed to save site settings' },
      { status: 500 }
    );
  }
}

// PUT /api/site-settings
export async function PUT(req: NextRequest) {
  return POST(req);
}
