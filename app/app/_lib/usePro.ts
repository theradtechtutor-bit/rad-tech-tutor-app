'use client';

import { useEffect, useRef, useState } from 'react';
import supabase from '@/lib/supabaseClient';

export function usePro() {
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const loadSeqRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const loadSeq = loadSeqRef.current + 1;
      loadSeqRef.current = loadSeq;
      const isCurrentLoad = () => mounted && loadSeqRef.current === loadSeq;

      try {
        console.log('[usePro] loading starts', { loadSeq });

        // null means still checking
        if (isCurrentLoad()) setIsPro(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('usePro session check error:', sessionError.message);
          if (isCurrentLoad()) {
            console.log('[usePro] final proStatus returned', {
              loadSeq,
              proStatus: false,
              reason: 'session_error',
            });
            setIsPro(false);
          }
          return;
        }

        const user = session?.user ?? null;

        console.log('[usePro] session user', {
          loadSeq,
          user_id: user?.id ?? null,
          email: user?.email ?? null,
        });

        // No logged-in user = free user.
        // Do NOT call getUser() here.
        if (!user) {
          if (isCurrentLoad()) {
            console.log('[usePro] final proStatus returned', {
              loadSeq,
              proStatus: false,
              reason: 'no_session_user',
            });
            setIsPro(false);
          }
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

        console.log('[usePro] user_access row by user_id', {
          loadSeq,
          row_found: Boolean(data),
          is_pro: data?.is_pro ?? null,
          pro_expires_at: data?.pro_expires_at ?? null,
        });

        const userIdProActive =
          data?.is_pro === true &&
          (!data?.pro_expires_at ||
            new Date(data.pro_expires_at).getTime() > Date.now());

        if (userIdProActive) {
          if (isCurrentLoad()) {
            console.log('[usePro] final proStatus returned', {
              loadSeq,
              proStatus: true,
              source: 'user_id',
            });
            setIsPro(true);
          }
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

          console.log('[usePro] user_access row by email', {
            loadSeq,
            row_found: Boolean(emailData),
            is_pro: emailData?.is_pro ?? null,
            pro_expires_at: emailData?.pro_expires_at ?? null,
          });

          const emailProActive =
            emailData?.is_pro === true &&
            (!emailData?.pro_expires_at ||
              new Date(emailData.pro_expires_at).getTime() > Date.now());

          if (isCurrentLoad()) {
            console.log('[usePro] final proStatus returned', {
              loadSeq,
              proStatus: emailProActive,
              source: 'email',
            });
            setIsPro(emailProActive);
          }
          return;
        }

        if (isCurrentLoad()) {
          console.log('[usePro] final proStatus returned', {
            loadSeq,
            proStatus: false,
            reason: 'no_email_fallback',
          });
          setIsPro(false);
        }
      } catch (error) {
        console.warn('usePro failed:', error);
        if (isCurrentLoad()) {
          console.log('[usePro] final proStatus returned', {
            loadSeq,
            proStatus: false,
            reason: 'exception',
          });
          setIsPro(false);
        }
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
