import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/admin/login/route';
import { SESSION_COOKIE } from '@/lib/auth';

function req(body: unknown, raw = false) {
  return new Request('http://localhost/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

describe('POST /api/admin/login', () => {
  it('sets a session cookie on valid credentials', async () => {
    const res = await POST(
      req({ email: 'elaine0301@me.com', password: 'elaine2026' })
    );
    expect(res.status).toBe(200);
    const cookie = res.headers.get('set-cookie') || '';
    expect(cookie).toContain(SESSION_COOKIE);
    expect(cookie.toLowerCase()).toContain('httponly');
  });

  it('returns 401 and no cookie on wrong password', async () => {
    const res = await POST(
      req({ email: 'elaine0301@me.com', password: 'nope' })
    );
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('returns 401 on unknown email', async () => {
    const res = await POST(
      req({ email: 'someone@else.com', password: 'elaine2026' })
    );
    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await POST(req({ email: 'elaine0301@me.com' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 on non-JSON body', async () => {
    const res = await POST(req('{not json', true));
    expect(res.status).toBe(400);
  });

  it('returns 400 when fields are not strings', async () => {
    const res = await POST(req({ email: 123, password: true }));
    expect(res.status).toBe(400);
  });
});
