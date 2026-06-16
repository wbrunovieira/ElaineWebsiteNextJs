import { describe, it, expect } from 'vitest';
import { SignJWT } from 'jose';
import {
  verifyCredentials,
  createSession,
  verifySession,
} from '@/lib/auth';

const SECRET = process.env.AUTH_SECRET as string;
const key = new TextEncoder().encode(SECRET);

describe('verifyCredentials', () => {
  it('accepts the configured email + password', () => {
    expect(verifyCredentials('elaine0301@me.com', 'elaine2026')).toBe(true);
  });

  it('is case-insensitive on the email', () => {
    expect(verifyCredentials('Elaine0301@ME.com', 'elaine2026')).toBe(true);
  });

  it('trims surrounding whitespace on the email', () => {
    expect(verifyCredentials('  elaine0301@me.com ', 'elaine2026')).toBe(
      true
    );
  });

  it('rejects a wrong password', () => {
    expect(verifyCredentials('elaine0301@me.com', 'wrong')).toBe(false);
  });

  it('rejects a wrong email', () => {
    expect(verifyCredentials('intruder@me.com', 'elaine2026')).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(verifyCredentials('elaine0301@me.com', '')).toBe(false);
  });

  it('is case-sensitive on the password', () => {
    expect(verifyCredentials('elaine0301@me.com', 'Elaine2026')).toBe(false);
  });

  it('fails closed when admin env vars are unset', () => {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    try {
      expect(verifyCredentials('elaine0301@me.com', 'elaine2026')).toBe(
        false
      );
    } finally {
      process.env.ADMIN_EMAIL = email;
      process.env.ADMIN_PASSWORD = password;
    }
  });
});

describe('createSession / verifySession', () => {
  it('round-trips a valid token', async () => {
    const token = await createSession('elaine0301@me.com');
    const payload = await verifySession(token);
    expect(payload?.sub).toBe('elaine0301@me.com');
  });

  it('returns null for a missing token', async () => {
    expect(await verifySession(undefined)).toBeNull();
  });

  it('returns null for a malformed token', async () => {
    expect(await verifySession('not.a.jwt')).toBeNull();
  });

  it('rejects a token signed with a different secret', async () => {
    const forged = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('elaine0301@me.com')
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode('a-totally-different-secret-value'));
    expect(await verifySession(forged)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const expired = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('elaine0301@me.com')
      .setIssuedAt(Math.floor(Date.now() / 1000) - 60 * 60)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(key);
    expect(await verifySession(expired)).toBeNull();
  });

  it('rejects an unsecured (alg: none) token', async () => {
    // header {"alg":"none"} . payload . (empty sig)
    const header = Buffer.from(
      JSON.stringify({ alg: 'none', typ: 'JWT' })
    ).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({ sub: 'elaine0301@me.com', role: 'admin' })
    ).toString('base64url');
    expect(await verifySession(`${header}.${payload}.`)).toBeNull();
  });
});
