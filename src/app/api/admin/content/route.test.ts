import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';
import type { SiteContent } from '@/lib/content';

// Mock the Blob-backed content layer so route logic is tested in isolation.
const getContentFresh = vi.fn();
const saveContent = vi.fn();
vi.mock('@/lib/content', () => ({
  getContentFresh: () => getContentFresh(),
  saveContent: (c: SiteContent) => saveContent(c),
}));

import { GET, PUT } from '@/app/api/admin/content/route';

const sample: SiteContent = {
  gallery: [],
  stories: [{ id: 's1', name: 'Enda', city: 'FL', content: 'hi' }],
  locations: [],
  sessions: [],
};

function putReq(body: unknown, raw = false) {
  return new Request('http://localhost/api/admin/content', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  getContentFresh.mockReset();
  saveContent.mockReset();
});

describe('GET /api/admin/content', () => {
  it('returns the current content', async () => {
    getContentFresh.mockResolvedValue(sample);
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(sample);
  });
});

describe('PUT /api/admin/content', () => {
  it('saves a valid payload and revalidates', async () => {
    saveContent.mockResolvedValue(undefined);
    const res = await PUT(putReq(sample));
    expect(res.status).toBe(200);
    expect(saveContent).toHaveBeenCalledOnce();
    expect(saveContent).toHaveBeenCalledWith(sample);
  });

  it('rejects an invalid payload with 422 and does not save', async () => {
    const bad = { ...sample, stories: [{ name: 'no id' }] };
    const res = await PUT(putReq(bad));
    expect(res.status).toBe(422);
    expect(saveContent).not.toHaveBeenCalled();
  });

  it('returns 400 on non-JSON body', async () => {
    const res = await PUT(putReq('{bad', true));
    expect(res.status).toBe(400);
    expect(saveContent).not.toHaveBeenCalled();
  });

  it('returns 502 when the store write fails', async () => {
    saveContent.mockImplementation(async () => {
      throw new Error('blob down');
    });
    const res = await PUT(putReq(sample));
    expect(res.status).toBe(502);
  });
});
