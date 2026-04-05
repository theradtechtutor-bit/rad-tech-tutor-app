import { NextResponse } from "next/server";
import { setValidatorCookie } from "@/lib/validator/session";

function getValidatorPairs() {
  const pairs: { u: string; p: string }[] = [];
  const suffixes = ["", "_2", "_3", "_4", "_5", "_6"];
  for (const suf of suffixes) {
    const u = process.env[`VALIDATOR_USERNAME${suf}`] || "";
    const p = process.env[`VALIDATOR_PASSWORD${suf}`] || "";
    if (u && p) pairs.push({ u, p });
  }
  return pairs;
}

function validatorPairs() {
  const pairs: { u: string; p: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const suffix = i === 1 ? "" : `_${i}`;
    const u = process.env[`VALIDATOR_USERNAME${suffix}`] || "";
    const p = process.env[`VALIDATOR_PASSWORD${suffix}`] || "";
    if (u && p) pairs.push({ u, p });
  }
  return pairs;
}

function pairs() {
  const list: Array<{ u: string; p: string }> = [];

  const direct = [
    [process.env.VALIDATOR_USERNAME, process.env.VALIDATOR_PASSWORD],
    [process.env.VALIDATOR_USERNAME_2, process.env.VALIDATOR_PASSWORD_2],
    [process.env.VALIDATOR_USERNAME_3, process.env.VALIDATOR_PASSWORD_3],
    [process.env.VALIDATOR_USERNAME_4, process.env.VALIDATOR_PASSWORD_4],
    [process.env.VALIDATOR_USERNAME_5, process.env.VALIDATOR_PASSWORD_5],
  ];

  for (const [u, p] of direct) {
    if (u && p) list.push({ u, p });
  }

  // Optional CSV: VALIDATOR_CREDENTIALS="userA:passA,userB:passB"
  const csv = (process.env.VALIDATOR_CREDENTIALS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const item of csv) {
    const i = item.indexOf(":");
    if (i > 0) {
      const u = item.slice(0, i).trim();
      const p = item.slice(i + 1).trim();
      if (u && p) list.push({ u, p });
    }
  }

  return list;
}

export async function POST(req: Request) {
  const { username, password } = await req.json().catch(() => ({}));

  const creds = pairs();
  const ok = creds.some((c) => c.u === username && c.p === password);

  if (!ok) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await setValidatorCookie(username);
  return NextResponse.json({ authenticated: true });
}
