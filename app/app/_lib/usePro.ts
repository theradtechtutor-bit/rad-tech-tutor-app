'use client';

import { useEffect, useState } from 'react';
import supabase from '@/lib/supabaseClient';

export function usePro() {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        // null means still checking
        if (mounted) setIsPro(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('usePro session check error:', sessionError.message);
          if (mounted) setIsPro(false);
          return;
        }

        const user = session?.user ?? null;

        // No logged-in user = free user.
        // Do NOT call getUser() here.
        if (!user) {
          if (mounted) setIsPro(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_access')
          .select('is_pro, email, pro_expires_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.warn('usePro user_id lookup error:', error.message);
        }

        const userIdProActive =
          data?.is_pro === true &&
          (!data?.pro_expires_at ||
            new Date(data.pro_expires_at).getTime() > Date.now());

        if (userIdProActive) {
          if (mounted) setIsPro(true);
          return;
        }

        if (user.email) {
          const normalizedEmail = user.email.toLowerCase();

          const { data: emailData, error: emailError } = await supabase
            .from('user_access')
            .select('is_pro, email, pro_expires_at')
            .eq('email', normalizedEmail)
            .maybeSingle();

          if (emailError) {
            console.warn('usePro email lookup error:', emailError.message);
          }

          const emailProActive =
            emailData?.is_pro === true &&
            (!emailData?.pro_expires_at ||
              new Date(emailData.pro_expires_at).getTime() > Date.now());

          if (mounted) setIsPro(emailProActive);
          return;
        }

        if (mounted) setIsPro(false);
      } catch (error) {
        console.warn('usePro failed:', error);
        if (mounted) setIsPro(false);
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return isPro;
}