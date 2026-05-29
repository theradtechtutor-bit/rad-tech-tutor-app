'use client';

type ProStatus = boolean | null | undefined;

export function logUpgradeRedirect({
  reason,
  proStatus,
  userId,
  email,
}: {
  reason: string;
  proStatus: ProStatus;
  userId?: string | null;
  email?: string | null;
}) {
  console.warn('[RTT Pro access redirect]', {
    user_id: userId || null,
    email: email || null,
    proStatus,
    reason,
  });
}
