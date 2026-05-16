import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type BlockType = 'email' | 'user_id' | 'device_id' | 'distinct_id' | 'ip';
type BlockScope = 'free_only' | 'all';

type BlockCheck = {
  type: BlockType;
  value: string;
};

type BlockedAccessRow = {
  type: BlockType;
  value: string;
  reason: string | null;
  applies_to: BlockScope | null;
};

function getIpAddress(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  return realIp || null;
}

function cleanValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function uniqueChecks(checks: BlockCheck[]) {
  const seen = new Set<string>();

  return checks.filter((check) => {
    const key = `${check.type}:${check.value}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function isActiveProAccess(row: { is_pro: boolean | null; pro_expires_at: string | null } | null) {
  if (row?.is_pro !== true) return false;

  if (!row.pro_expires_at) return true;

  return new Date(row.pro_expires_at).getTime() > Date.now();
}

export async function POST(req: NextRequest) {
  try {
    const admin = supabaseAdmin();

    const { data: setting, error: settingError } = await admin
      .from('app_settings')
      .select('value')
      .eq('key', 'access_blocking_enabled')
      .maybeSingle();

    if (settingError) {
      console.error('Access blocking setting error:', settingError);
    }

    const enabled = setting?.value === 'true';

    if (!enabled) {
      return NextResponse.json({ blocked: false, enabled: false });
    }

    const body = await req.json().catch(() => ({}));

    const localDeviceId = cleanValue(body.device_id);
    const distinctId = cleanValue(body.distinct_id);
    const posthogDeviceId = cleanValue(body.posthog_device_id);
    const ipAddress = getIpAddress(req);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let isPro = false;

    if (user?.id) {
      const { data: accessByUserId, error: accessByUserIdError } = await admin
        .from('user_access')
        .select('is_pro, pro_expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (accessByUserIdError) {
        console.error('Access block user_id pro lookup error:', accessByUserIdError);
      }

      isPro = isActiveProAccess(accessByUserId);
    }

    if (!isPro && user?.email) {
      const normalizedEmail = user.email.toLowerCase();

      const { data: accessByEmail, error: accessByEmailError } = await admin
        .from('user_access')
        .select('is_pro, pro_expires_at')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (accessByEmailError) {
        console.error('Access block email pro lookup error:', accessByEmailError);
      }

      isPro = isActiveProAccess(accessByEmail);
    }

    const allChecks: BlockCheck[] = [];

    if (user?.id) {
      allChecks.push({ type: 'user_id', value: user.id });
    }

    if (user?.email) {
      allChecks.push({ type: 'email', value: user.email.toLowerCase() });
    }

    if (localDeviceId) {
      allChecks.push({ type: 'device_id', value: localDeviceId });
    }

    if (posthogDeviceId) {
      allChecks.push({ type: 'device_id', value: posthogDeviceId });
    }

    if (distinctId) {
      allChecks.push({ type: 'distinct_id', value: distinctId });
    }

    if (ipAddress) {
      allChecks.push({ type: 'ip', value: ipAddress });
    }

    const checks = uniqueChecks(allChecks);

    if (!checks.length) {
      return NextResponse.json({ blocked: false, enabled: true, is_pro: isPro });
    }

    const types = Array.from(new Set(checks.map((check) => check.type)));
    const values = Array.from(new Set(checks.map((check) => check.value)));

    const { data: possibleBlockedRows, error: blockError } = await admin
      .from('blocked_access')
      .select('type, value, reason, applies_to')
      .eq('is_active', true)
      .in('type', types)
      .in('value', values);

    if (blockError) {
      console.error('Access block lookup error:', blockError);
      return NextResponse.json({ blocked: false, enabled: true, is_pro: isPro });
    }

    const exactMatches = ((possibleBlockedRows || []) as BlockedAccessRow[]).filter((row) =>
      checks.some((check) => check.type === row.type && check.value === row.value),
    );

    const blockingMatch = exactMatches.find((row) => {
      const appliesTo = row.applies_to || 'free_only';

      if (!isPro) {
        return appliesTo === 'free_only' || appliesTo === 'all';
      }

      // Paid users are protected from device, distinct_id, and IP blocks.
      // To block a paid user, you must intentionally block their email/user_id with applies_to = 'all'.
      return appliesTo === 'all' && (row.type === 'email' || row.type === 'user_id');
    });

    if (blockingMatch) {
      return NextResponse.json({
        blocked: true,
        enabled: true,
        is_pro: isPro,
        matched_type: blockingMatch.type,
        reason: blockingMatch.reason || null,
      });
    }

    return NextResponse.json({ blocked: false, enabled: true, is_pro: isPro });
  } catch (error) {
    console.error('Access check route error:', error);

    // Fail open so a bug in this feature does not lock real users out.
    return NextResponse.json({ blocked: false, enabled: true });
  }
}
