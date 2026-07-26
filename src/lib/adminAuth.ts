import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simple in-memory session store. Resets on server restart, which is fine
// for a single-admin portal.
const sessions = new Map<string, { expiresAt: number }>();

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function createSession(): string {
  const token = generateToken();
  sessions.set(token, { expiresAt: Date.now() + SESSION_DURATION_MS });
  return token;
}

export function validateToken(token: string | null | undefined): boolean {
  if (!token) return false;
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

/**
 * Extract the admin token from the Authorization header.
 * Expects: "Bearer <token>"
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

/**
 * Validate admin password against env var.
 */
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "mujadmin";
  return password === expected;
}
