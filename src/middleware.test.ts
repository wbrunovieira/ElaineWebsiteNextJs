import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { createSession, SESSION_COOKIE } from '@/lib/auth';

function request(path: string, token?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: token ? { cookie: `${SESSION_COOKIE}=${token}` } : {},
  });
}

describe('middleware admin gate', () => {
  it('redirects unauthenticated /admin to /admin/login', async () => {
    const res = await middleware(request('/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });

  it('returns 401 for unauthenticated /api/admin routes', async () => {
    const res = await middleware(request('/api/admin/content'));
    expect(res.status).toBe(401);
  });

  it('lets the login page through without a cookie', async () => {
    const res = await middleware(request('/admin/login'));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('lets the login API through without a cookie', async () => {
    const res = await middleware(request('/api/admin/login'));
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('allows an authenticated /admin request', async () => {
    const token = await createSession('elaine0301@me.com');
    const res = await middleware(request('/admin', token));
    expect(res.headers.get('location')).toBeNull();
    expect(res.status).not.toBe(401);
  });

  it('rejects a tampered cookie', async () => {
    const res = await middleware(
      request('/admin', 'garbage.token.value')
    );
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/admin/login');
  });
});
