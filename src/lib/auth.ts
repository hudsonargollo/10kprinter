// Self-contained email+password auth for the internal ops dashboard — no
// external auth provider, no dependency. Ported from theleadmachine's own
// auth module (same pattern, proven live). PBKDF2 capped at 100,000
// iterations because Cloudflare Workers' WebCrypto rejects anything higher.
import type { Env } from "../types";

const PBKDF2_ITERATIONS = 100_000;
const SESSION_COOKIE = "mm_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  role: string;
  created_at: string;
}

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return bytes;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return `${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(bits)}`;
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  if (!stored) return false;
  const [iterStr, saltHex, hashHex] = stored.split(":");
  const iterations = Number(iterStr) || PBKDF2_ITERATIONS;
  const salt = fromHex(saltHex);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256,
  );
  return toHex(bits) === hashHex;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

async function signToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const body = btoa(JSON.stringify(payload));
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return `${body}.${toHex(sig)}`;
}

async function verifyToken(token: string, secret: string): Promise<{ userId: string; exp: number } | null> {
  if (!token || !token.includes(".")) return null;
  const [body, sigHex] = token.split(".");
  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify("HMAC", key, fromHex(sigHex) as BufferSource, new TextEncoder().encode(body));
  if (!valid) return null;
  try {
    const payload = JSON.parse(atob(body));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("Cookie") || "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function createSessionCookie(env: Env, userId: string): Promise<string> {
  const exp = Date.now() + SESSION_TTL_SECONDS * 1000;
  const token = await signToken({ userId, exp }, env.SESSION_SECRET);
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function getSessionUserId(request: Request, env: Env): Promise<string | null> {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const payload = await verifyToken(token, env.SESSION_SECRET);
  return payload?.userId || null;
}

export async function getUserById(db: D1Database, id: string): Promise<UserRow | null> {
  return db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
}

export async function getUserByEmail(db: D1Database, email: string): Promise<UserRow | null> {
  return db.prepare("SELECT * FROM users WHERE email = ?").bind(email.toLowerCase()).first<UserRow>();
}
