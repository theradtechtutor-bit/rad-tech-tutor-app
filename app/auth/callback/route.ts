import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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
        getAll: () => requestCookies.split(/;\s*/).filter(Boolean).map((cookie) => {
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
    }
  );

  await supabase.auth.exchangeCodeForSession(code);
  return response;
}
