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

import { POST } from '@/app/api/admin/mux/delete/route';

function req(body: unknown, raw = false) {
  return new Request('http://localhost/api/admin/mux/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: raw ? (body as string) : JSON.stringify(body),
  });
}

beforeEach(() => {
  createDirectUpload.mockReset();
  getUploadStatus.mockReset();
  deleteAsset.mockReset();
});

describe('POST /api/admin/mux/delete', () => {
  it('deletes an asset by id', async () => {
    deleteAsset.mockResolvedValue(undefined);
    const res = await POST(req({ assetId: 'asset_1' }));
    expect(res.status).toBe(200);
    expect(deleteAsset).toHaveBeenCalledWith('asset_1');
  });

  it('returns 400 when assetId is missing', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    expect(deleteAsset).not.toHaveBeenCalled();
  });

  it('returns 400 on non-JSON body', async () => {
    const res = await POST(req('{bad', true));
    expect(res.status).toBe(400);
  });

  it('returns 502 when Mux fails', async () => {
    deleteAsset.mockImplementation(async () => {
      throw new Error('mux down');
    });
    const res = await POST(req({ assetId: 'asset_1' }));
    expect(res.status).toBe(502);
  });
});
