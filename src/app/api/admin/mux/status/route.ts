import { NextResponse } from 'next/server';
import { getUploadStatus } from '@/lib/mux';

export async function GET(request: Request) {
  const uploadId = new URL(request.url).searchParams.get('uploadId');
  if (!uploadId) {
    return NextResponse.json(
      { error: 'Missing uploadId' },
      { status: 400 }
    );
  }
  try {
    const status = await getUploadStatus(uploadId);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to read status' },
      { status: 502 }
    );
  }
}
