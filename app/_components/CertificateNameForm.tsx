'use client';

import { useEffect, useState } from 'react';

const KEY = 'rtt_certificate_name';

export default function CertificateNameForm() {
  const [name, setName] = useState('');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) || '';
      setName(saved);
    } catch {}
  }, []);

  function save(v: string) {
    setName(v);
    try {
      window.localStorage.setItem(KEY, v);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold">Certificate Name</div>
      <div className="mt-1 text-xs text-white/60">
        This name will appear on your CE certificate.
      </div>

      <input
        className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
        placeholder="Type your full name"
        value={name}
        onChange={(e) => save(e.target.value)}
      />

      <div className="mt-2 text-xs text-white/50">Saved automatically.</div>
    </div>
  );
}
