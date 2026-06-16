import { NextResponse } from 'next/server';
import { deleteBlob } from '@/lib/blob';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { url } = (body ?? {}) as { url?: unknown };
  if (typeof url !== 'string' || !url) {
    return NextResponse.json(
      { error: 'Missing url' },
      { status: 400 }
    );
  }

  // Only allow deleting blobs from our own store.
  if (!url.includes('.public.blob.vercel-storage.com')) {
    return NextResponse.json(
      { error: 'Refusing to delete a non-Blob URL' },
      { status: 400 }
    );
  }

  try {
    await deleteBlob(url);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
