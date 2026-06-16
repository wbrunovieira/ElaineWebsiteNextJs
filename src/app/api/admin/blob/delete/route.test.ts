import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const deleteBlob = vi.fn();
const uploadGalleryImage = vi.fn();
vi.mock('@/lib/blob', () => ({
  deleteBlob: (url: string) => deleteBlob(url),
  uploadGalleryImage: (file: File) => uploadGalleryImage(file),
}));

import { POST } from '@/app/api/admin/blob/delete/route';

const BLOB_URL =
  'https://teststore.public.blob.vercel-storage.com/gallery/photo-abc.jpg';

function req(body: unknown, raw = false) {
  return new Request('http://localhost/api/admin/blob/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  deleteBlob.mockReset();
  uploadGalleryImage.mockReset();
});

describe('POST /api/admin/blob/delete', () => {
  it('deletes a valid Blob URL', async () => {
    deleteBlob.mockResolvedValue(undefined);
    const res = await POST(req({ url: BLOB_URL }));
    expect(res.status).toBe(200);
    expect(deleteBlob).toHaveBeenCalledWith(BLOB_URL);
  });

  it('refuses to delete a non-Blob URL', async () => {
    const res = await POST(req({ url: 'https://evil.com/x.jpg' }));
    expect(res.status).toBe(400);
    expect(deleteBlob).not.toHaveBeenCalled();
  });

  it('returns 400 when url is missing', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(deleteBlob).not.toHaveBeenCalled();
  });

  it('returns 400 on non-JSON body', async () => {
    const res = await POST(req('{bad', true));
    expect(res.status).toBe(400);
  });

  it('returns 502 when the store delete fails', async () => {
    deleteBlob.mockImplementation(async () => {
      throw new Error('blob down');
    });
    const res = await POST(req({ url: BLOB_URL }));
    expect(res.status).toBe(502);
  });
});
