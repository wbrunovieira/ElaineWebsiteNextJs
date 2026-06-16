import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'elaine_admin';
const SESSION_TTL = '7d';

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not set');
  }
  return new TextEncoder().encode(secret);
}

/** Constant-time-ish string compare to avoid trivial timing leaks. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Validates the submitted credentials against the configured admin account. */
export function verifyCredentials(
  email: string,
  password: string
): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return false;
  // Email is case-insensitive; password is exact.
  return (
    safeEqual(email.trim().toLowerCase(), adminEmail.toLowerCase()) &&
    safeEqual(password, adminPassword)
  );
}

/** Issues a signed session token for the given email. */
export async function createSession(email: string): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(email.toLowerCase())
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secretKey());
}

/** Returns the token payload when valid, or null otherwise. */
export async function verifySession(
  token: string | undefined
): Promise<{ sub?: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}
