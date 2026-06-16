import { NextResponse } from 'next/server';
import { createDirectUpload } from '@/lib/mux';

export async function POST(request: Request) {
  const origin = request.headers.get('origin') || '*';
  try {
    const { uploadId, uploadUrl } = await createDirectUpload(origin);
    return NextResponse.json({ uploadId, uploadUrl });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create upload' },
      { status: 502 }
    );
  }
}
