import { NextResponse } from 'next/server';

// Kit (ConvertKit) subscription endpoint (form subscribe)
// Docs historically use: POST https://api.convertkit.com/v3/forms/{form_id}/subscribe
// Body: { api_key, email }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body?.email?.trim();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.KIT_API_KEY;
    const formId = process.env.KIT_FORM_ID;

    if (!apiKey || !formId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Missing KIT_API_KEY or KIT_FORM_ID. Add them to .env.local (and Vercel env vars).',
        },
        { status: 500 }
      );
    }

    const url = `https://api.convertkit.com/v3/forms/${formId}/subscribe`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, email }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: text || 'Kit subscribe failed' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Bad request' },
      { status: 400 }
    );
  }
}
