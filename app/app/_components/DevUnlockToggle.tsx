"use client";

import { useEffect, useState } from "react";

const KEY = "rtt_dev_unlock";

export default function DevUnlockToggle({ compact }: { compact?: boolean }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      setEnabled(localStorage.getItem(KEY) === "1");
    } catch {}
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  };

  if (compact) {
    return (
      <button
        onClick={toggle}
        className="rounded-xl rtt-card px-3 py-2 text-xs hover:bg-white/10"
        title="Developer unlock toggle (local only)"
      >
        Dev Unlock: <span className={enabled ? "rtt-success-text" : "rtt-muted"}>{enabled ? "ON" : "OFF"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="mt-4 w-full rounded-xl rtt-card px-4 py-3 text-sm hover:bg-white/10"
    >
      Dev Unlock: <span className={enabled ? "rtt-success-text" : "rtt-muted"}>{enabled ? "ON" : "OFF"}</span>
    </button>
  );
}
