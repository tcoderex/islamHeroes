import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text') || '';
  const lang = searchParams.get('lang') || 'ar';

  if (!text.trim()) {
    return new NextResponse('Text parameter is required', { status: 400 });
  }

  // Clean text: strip brackets, parens, or extraneous symbols
  const cleanText = text
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .trim();

  try {
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(cleanText || text)}`;
    const response = await fetch(ttsUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'audio/mpeg, audio/*',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && (contentType.includes('audio') || contentType.includes('octet-stream'))) {
      const arrayBuffer = await response.arrayBuffer();
      const totalLength = arrayBuffer.byteLength;

      if (totalLength > 0) {
        const rangeHeader = req.headers.get('range');
        const commonHeaders: Record<string, string> = {
          'Content-Type': 'audio/mpeg',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Netlify-CDN-Cache-Control': 'no-store',
        };

        if (rangeHeader) {
          const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
          if (match) {
            const start = match[1] ? parseInt(match[1], 10) : 0;
            const end = match[2] ? Math.min(parseInt(match[2], 10), totalLength - 1) : totalLength - 1;

            if (!isNaN(start) && !isNaN(end) && start >= 0 && start <= end && start < totalLength) {
              const sliced = arrayBuffer.slice(start, end + 1);
              return new NextResponse(sliced, {
                status: 206,
                headers: {
                  ...commonHeaders,
                  'Content-Range': `bytes ${start}-${end}/${totalLength}`,
                  'Content-Length': String(sliced.byteLength),
                },
              });
            }
          }
        }

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            ...commonHeaders,
            'Content-Length': String(totalLength),
          },
        });
      }
    }
  } catch {
    // fallthrough
  }

  return new NextResponse('Failed to synthesize audio', {
    status: 500,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
