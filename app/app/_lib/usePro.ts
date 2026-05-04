'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function usePro() {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // null means: still checking. Do NOT treat this as free.
      if (mounted) setIsPro(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error('usePro auth error:', userError);
      }

      if (!user) {
        if (mounted) setIsPro(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_access')
        .select('is_pro, email')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('usePro user_access user_id error:', error);
      }

      if (data?.is_pro === true) {
        if (mounted) setIsPro(true);
        return;
      }

      // Fallback: if user_id lookup fails or returns no pro,
      // check the same logged-in email too.
      if (user.email) {
        const normalizedEmail = user.email.toLowerCase();

        const { data: emailData, error: emailError } = await supabase
          .from('user_access')
          .select('is_pro, email')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (emailError) {
          console.error('usePro user_access email fallback error:', emailError);
        }

        if (mounted) {
          setIsPro(Boolean(emailData?.is_pro));
        }

        return;
      }

      if (mounted) setIsPro(false);
    };

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