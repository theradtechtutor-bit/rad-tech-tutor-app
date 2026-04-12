import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

async function capturePosthogSignup(user: {
  id: string;
  email?: string | null;
}) {
  const key = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST;

  if (!key || !host) return;

  try {
    await fetch(`${host.replace(/\/$/, '')}/capture/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: key,
        event: 'signup_completed',
        distinct_id: user.id,
        timestamp: new Date().toISOString(),
        properties: {
          source: 'auth_callback',
          $set: {
            email: user.email ?? '',
          },
        },
      }),
    });
  } catch (error) {
    console.error('PostHog signup capture failed:', error);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') ?? '/app/roadmap';

  if (!code) {
    return NextResponse.redirect(new URL('/app/login', url.origin));
  }

  const response = NextResponse.redirect(new URL(next, url.origin));
  const requestCookies = request.headers.get('cookie') ?? '';

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          requestCookies
            .split(/;\s*/)
            .filter(Boolean)
            .map((cookie) => {
              const index = cookie.indexOf('=');
              const name = index >= 0 ? cookie.slice(0, index) : cookie;
              const value = index >= 0 ? cookie.slice(index + 1) : '';
              return { name, value };
            }),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('exchangeCodeForSession error:', exchangeError);
    return NextResponse.redirect(new URL('/app/login', url.origin));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('getUser error:', userError);
    return response;
  }

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileLookupError) {
    console.error('profile lookup error:', profileLookupError);
    return response;
  }

  if (!existingProfile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
    });

    if (insertError) {
      console.error('profile insert error:', insertError);
      return response;
    }

    await capturePosthogSignup({
      id: user.id,
      email: user.email,
    });
  }

  return response;
}
