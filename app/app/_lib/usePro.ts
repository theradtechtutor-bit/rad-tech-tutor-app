'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function usePro() {
  const [isPro, setIsPro] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setIsPro(false);
        return;
      }

      const { data } = await supabase
        .from('user_access')
        .select('is_pro')
        .eq('user_id', user.id)
        .single();

      if (mounted) {
        setIsPro(!!data?.is_pro);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return isPro;
}
