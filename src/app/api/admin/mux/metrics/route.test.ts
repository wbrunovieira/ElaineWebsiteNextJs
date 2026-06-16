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
const getVideoMetrics = vi.fn();
vi.mock('@/lib/mux', () => ({
  createDirectUpload: (origin: string) => createDirectUpload(origin),
  getUploadStatus: (id: string) => getUploadStatus(id),
  deleteAsset: (id: string) => deleteAsset(id),
  getVideoMetrics: (id: string) => getVideoMetrics(id),
}));

import { GET } from '@/app/api/admin/mux/metrics/route';

const reqWith = (qs: string) =>
  new Request(`http://localhost/api/admin/mux/metrics${qs}`);

beforeEach(() => {
  createDirectUpload.mockReset();
  getUploadStatus.mockReset();
  deleteAsset.mockReset();
  getVideoMetrics.mockReset();
});

describe('GET /api/admin/mux/metrics', () => {
  it('returns the video metrics', async () => {
    getVideoMetrics.mockResolvedValue({
      views: 42,
      totalWatchTimeMs: 120000,
      avgWatchTimeMs: 2857,
    });
    const res = await GET(reqWith('?videoId=pb_1'));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      views: 42,
      totalWatchTimeMs: 120000,
      avgWatchTimeMs: 2857,
    });
    expect(getVideoMetrics).toHaveBeenCalledWith('pb_1');
  });

  it('returns 400 when videoId is missing', async () => {
    const res = await GET(reqWith(''));
    expect(res.status).toBe(400);
    expect(getVideoMetrics).not.toHaveBeenCalled();
  });

  it('returns 502 when Mux Data fails', async () => {
    getVideoMetrics.mockImplementation(async () => {
      throw new Error('mux data down');
    });
    const res = await GET(reqWith('?videoId=pb_2'));
    expect(res.status).toBe(502);
  });
});
