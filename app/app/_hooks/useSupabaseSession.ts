"use client";

import { useEffect, useState } from "react";
import supabase from '@/lib/supabaseClient';
import { identifyUser, resetAnalyticsUser } from '@/lib/analytics';
type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const nextSession = data.session ?? null;
      setSession(nextSession);

      if (nextSession?.user?.id) {
        identifyUser(nextSession.user.id, {
          email: nextSession.user.email ?? '',
        });
      } else {
        resetAnalyticsUser();
      }

      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextSession = session ?? null;
      setSession(nextSession);

      if (nextSession?.user?.id) {
        identifyUser(nextSession.user.id, {
          email: nextSession.user.email ?? '',
        });
      } else {
        resetAnalyticsUser();
      }

      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}
