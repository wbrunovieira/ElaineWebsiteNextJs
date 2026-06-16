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

import { GET } from '@/app/api/admin/mux/status/route';

const reqWith = (qs: string) =>
  new Request(`http://localhost/api/admin/mux/status${qs}`);

beforeEach(() => {
  createDirectUpload.mockReset();
  getUploadStatus.mockReset();
  deleteAsset.mockReset();
});

describe('GET /api/admin/mux/status', () => {
  it('returns the ready status with ids', async () => {
    getUploadStatus.mockResolvedValue({
      status: 'ready',
      assetId: 'asset_1',
      playbackId: 'pb_1',
    });
    const res = await GET(reqWith('?uploadId=up_1'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      status: 'ready',
      assetId: 'asset_1',
      playbackId: 'pb_1',
    });
    expect(getUploadStatus).toHaveBeenCalledWith('up_1');
  });

  it('reports a still-processing upload', async () => {
    getUploadStatus.mockResolvedValue({ status: 'processing' });
    const res = await GET(reqWith('?uploadId=up_2'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: 'processing' });
  });

  it('returns 400 when uploadId is missing', async () => {
    const res = await GET(reqWith(''));
    expect(res.status).toBe(400);
    expect(getUploadStatus).not.toHaveBeenCalled();
  });

  it('returns 502 when Mux fails', async () => {
    getUploadStatus.mockImplementation(async () => {
      throw new Error('mux down');
    });
    const res = await GET(reqWith('?uploadId=up_3'));
    expect(res.status).toBe(502);
  });
});
