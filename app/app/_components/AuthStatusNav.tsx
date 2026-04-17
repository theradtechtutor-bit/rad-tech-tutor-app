'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { clearRttClientState } from '@/lib/progressStore';

type AccessRow = {
  is_pro: boolean;
};

type Props = {
  showGetPro?: boolean;
  mobileCompact?: boolean;
};

export default function AuthStatusNav({
  showGetPro = true,
  mobileCompact = false,
}: Props) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function loadState() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEmail(null);
      setAvatarUrl(null);
      setIsGoogleUser(false);
      setIsPro(false);
      setLoading(false);
      return;
    }

    const provider =
      user.app_metadata?.provider ?? user.identities?.[0]?.provider ?? null;

    const googleAvatar =
      user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null;

    setEmail(user.email ?? null);
    setIsGoogleUser(provider === 'google');
    setAvatarUrl(provider === 'google' ? googleAvatar : null);

    const { data } = await supabase
      .from('user_access')
      .select('is_pro')
      .eq('user_id', user.id)
      .maybeSingle<AccessRow>();

    setIsPro(Boolean(data?.is_pro));
    setLoading(false);
  }

  useEffect(() => {
    loadState();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadState();
      router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  async function onSignOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
    clearRttClientState();
    setEmail(null);
    setAvatarUrl(null);
    setIsGoogleUser(false);
    setIsPro(false);
    window.location.assign('/app/login');
  }

  if (loading) {
    return mobileCompact ? null : (
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
        ...
      </div>
    );
  }

  if (!email) {
    if (mobileCompact) return null;

    return (
      <div className="flex items-center gap-2">
        {showGetPro && (
          <Link
            href="/app/upgrade"
            className="hidden rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 lg:inline-flex"
          >
            <span className="whitespace-nowrap">Get Pro</span>
          </Link>
        )}

        <Link
          href="/app/login"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          <span className="whitespace-nowrap">Sign In</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showGetPro &&
        !mobileCompact &&
        (isPro ? (
          <Link
            href="/app/dashboard"
            className="hidden rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 lg:inline-flex"
          >
            RTT Mastery Method
          </Link>
        ) : (
          <Link
            href="/app/upgrade"
            className="hidden rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300 lg:inline-flex"
          >
            <span className="whitespace-nowrap">Get Pro</span>
          </Link>
        ))}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
          title="Account menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          type="button"
        >
          <div className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-6 w-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-white/80">
                {email?.[0]?.toUpperCase()}
              </div>
            )}

            <span
              className={
                mobileCompact
                  ? 'hidden max-w-[120px] truncate whitespace-nowrap sm:block'
                  : 'block max-w-[180px] truncate whitespace-nowrap'
              }
            >
              {avatarUrl ? email : email}
            </span>
          </div>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[color:var(--rtt-bg)] shadow-2xl">
            <div className="border-b border-white/10 px-4 py-3 text-xs text-white/50">
              Signed in as
              <div className="mt-1 truncate text-sm text-white/85">{email}</div>
              {isGoogleUser && (
                <div className="mt-1 text-[11px] text-white/40">
                  Google account
                </div>
              )}
            </div>

            <button
              onClick={onSignOut}
              className="block w-full px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5"
              type="button"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
