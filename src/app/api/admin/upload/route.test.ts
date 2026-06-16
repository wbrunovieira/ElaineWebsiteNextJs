import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const uploadGalleryImage = vi.fn();
const deleteBlob = vi.fn();
vi.mock('@/lib/blob', () => ({
  uploadGalleryImage: (file: File) => uploadGalleryImage(file),
  deleteBlob: (url: string) => deleteBlob(url),
}));

import { POST } from '@/app/api/admin/upload/route';

const UPLOADED_URL =
  'https://teststore.public.blob.vercel-storage.com/gallery/x-123.webp';

function formReq(file?: File) {
  const form = new FormData();
  if (file) form.set('file', file);
  return new Request('http://localhost/api/admin/upload', {
    method: 'POST',
    body: form,
  });
}

function image(type: string, bytes = 1024) {
  return new File([new Uint8Array(bytes)], 'photo.webp', { type });
}

beforeEach(() => {
  uploadGalleryImage.mockReset();
  deleteBlob.mockReset();
});

describe('POST /api/admin/upload', () => {
  it('uploads a valid image and returns its url', async () => {
    uploadGalleryImage.mockResolvedValue(UPLOADED_URL);
    const res = await POST(formReq(image('image/webp')));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ url: UPLOADED_URL });
  });

  it('returns 400 when no file is provided', async () => {
    const res = await POST(formReq());
    expect(res.status).toBe(400);
    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });

  it('rejects an unsupported content type', async () => {
    const res = await POST(formReq(image('application/pdf')));
    expect(res.status).toBe(415);
    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });

  it('rejects a file over the size limit', async () => {
    const res = await POST(
      formReq(image('image/jpeg', 5 * 1024 * 1024))
    );
    expect(res.status).toBe(413);
    expect(uploadGalleryImage).not.toHaveBeenCalled();
  });

  it('returns 502 when the upload fails', async () => {
    uploadGalleryImage.mockImplementation(async () => {
      throw new Error('blob down');
    });
    const res = await POST(formReq(image('image/webp')));
    expect(res.status).toBe(502);
  });
});
