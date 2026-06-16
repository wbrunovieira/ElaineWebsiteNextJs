import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const createDirectUpload = vi.fn();
const getUploadStatus = vi.fn();
const deleteAsset = vi.fn();
vi.mock('@/lib/mux', () => ({
  createDirectUpload: (origin: string) => createDirectUpload(origin),
  getUploadStatus: (id: string) => getUploadStatus(id),
  deleteAsset: (id: string) => deleteAsset(id),
}));

import { POST } from '@/app/api/admin/mux/upload/route';

function req() {
  return new Request('http://localhost/api/admin/mux/upload', {
    method: 'POST',
    headers: { origin: 'http://localhost' },
  });
}

beforeEach(() => {
  createDirectUpload.mockReset();
  getUploadStatus.mockReset();
  deleteAsset.mockReset();
});

describe('POST /api/admin/mux/upload', () => {
  it('returns the direct upload url + id', async () => {
    createDirectUpload.mockResolvedValue({
      uploadId: 'up_1',
      uploadUrl: 'https://storage.mux.com/up_1',
    });
    const res = await POST(req());
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      uploadId: 'up_1',
      uploadUrl: 'https://storage.mux.com/up_1',
    });
    expect(createDirectUpload).toHaveBeenCalledWith('http://localhost');
  });

  it('returns 502 when Mux fails', async () => {
    createDirectUpload.mockImplementation(async () => {
      throw new Error('mux down');
    });
    const res = await POST(req());
    expect(res.status).toBe(502);
  });
});
