'use client';

import { useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export default function LogoutPage() {
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      window.location.href = '/app/login';
    });
  }, []);

  return (
    <div className="mx-auto mt-16 max-w-md rtt-card rounded-2xl p-6">
      Logging out…
    </div>
  );
}
