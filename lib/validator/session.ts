import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "validator_session";

function getValidatorUsernames() {
  const out: string[] = [];
  const suffixes = ["", "_2", "_3", "_4", "_5", "_6"];
  for (const suf of suffixes) {
    const u = process.env[`VALIDATOR_USERNAME${suf}`] || "";
    if (u) out.push(u);
  }
  return out;
}

function secret() {
  return process.env.VALIDATOR_SECRET || process.env.VALIDATOR_PASSWORD || "dev-secret";
}

function hmac(input: string) {
  return crypto.createHmac("sha256", secret()).update(input).digest("hex");
}

export function makeValidatorCookieValue(username: string) {
  return `${username}:${hmac(username)}`;
}

export async function clearValidatorCookie() {
  (await cookies()).set(COOKIE_NAME, "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export async function setValidatorCookie(username: string) {
  (await cookies()).set(COOKIE_NAME, makeValidatorCookieValue(username), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 24h
  });
}

export async function getValidatorUsername() {
  const raw = (await cookies()).get(COOKIE_NAME)?.value || "";
  const parts = raw.split(":");
  if (parts.length < 2) return null;

  const username = parts[0] || "";
  const sig = parts.slice(1).join(":") || "";
  if (!username || !sig) return null;

  const allowed = new Set(getValidatorUsernames());
  if (!allowed.has(username)) return null;

  const expected = hmac(username);
  return sig === expected ? username : null;
}

export async function isValidatorAuthed() {
  const u = await getValidatorUsername();
  return !!u;
}
