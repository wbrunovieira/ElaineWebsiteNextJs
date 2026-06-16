import { NextResponse } from 'next/server';
import { getVideoMetrics } from '@/lib/mux';

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get('videoId');
  if (!videoId) {
    return NextResponse.json(
      { error: 'Missing videoId' },
      { status: 400 }
    );
  }
  try {
    const metrics = await getVideoMetrics(videoId);
    return NextResponse.json(metrics);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to read metrics' },
      { status: 502 }
    );
  }
}
