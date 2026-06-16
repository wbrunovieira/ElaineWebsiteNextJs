import Mux from '@mux/mux-node';

function client(): Mux {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error('Mux credentials are not set');
  }
  return new Mux({ tokenId, tokenSecret });
}

export interface MuxStatus {
  status: 'processing' | 'ready' | 'error';
  assetId?: string;
  playbackId?: string;
}

/** Creates a direct (client-side) upload and returns its URL + id. */
export async function createDirectUpload(
  origin: string
): Promise<{ uploadId: string; uploadUrl: string }> {
  const mux = client();
  const upload = await mux.video.uploads.create({
    cors_origin: origin || '*',
    new_asset_settings: { playback_policy: ['public'] },
  });
  if (!upload.id || !upload.url) {
    throw new Error('Mux did not return a valid upload');
  }
  return { uploadId: upload.id, uploadUrl: upload.url };
}

/** Polls an upload → its asset, reporting processing/ready/error + ids. */
export async function getUploadStatus(
  uploadId: string
): Promise<MuxStatus> {
  const mux = client();
  const upload = await mux.video.uploads.retrieve(uploadId);
  if (
    upload.status === 'errored' ||
    upload.status === 'cancelled' ||
    upload.status === 'timed_out'
  ) {
    return { status: 'error' };
  }
  if (!upload.asset_id) return { status: 'processing' };

  const asset = await mux.video.assets.retrieve(upload.asset_id);
  if (asset.status === 'ready') {
    return {
      status: 'ready',
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
    };
  }
  if (asset.status === 'errored') {
    return { status: 'error', assetId: asset.id };
  }
  return { status: 'processing', assetId: asset.id };
}

/** Deletes a Mux asset. */
export async function deleteAsset(assetId: string): Promise<void> {
  const mux = client();
  await mux.video.assets.delete(assetId);
}

export interface VideoMetrics {
  views: number;
  totalWatchTimeMs: number;
  avgWatchTimeMs: number;
}

/**
 * Mux Data metrics for a single video over the last 30 days. `videoId` must
 * match the `metadata.video_id` reported by the player (we use the playbackId).
 */
export async function getVideoMetrics(
  videoId: string
): Promise<VideoMetrics> {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error('Mux credentials are not set');
  }
  const auth = Buffer.from(`${tokenId}:${tokenSecret}`).toString(
    'base64'
  );
  const url = new URL(
    'https://api.mux.com/data/v1/metrics/video_startup_time/overall'
  );
  url.searchParams.append('timeframe[]', '30:days');
  url.searchParams.append('filters[]', `video_id:${videoId}`);

  const res = await fetch(url, {
    headers: { authorization: `Basic ${auth}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Mux Data error ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: { total_views?: number; total_watch_time?: number };
  };
  const views = json.data?.total_views ?? 0;
  const totalWatchTimeMs = json.data?.total_watch_time ?? 0;
  const avgWatchTimeMs =
    views > 0 ? Math.round(totalWatchTimeMs / views) : 0;
  return { views, totalWatchTimeMs, avgWatchTimeMs };
}
