import { NextResponse } from 'next/server';
import { deleteAsset } from '@/lib/mux';

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

  const { assetId } = (body ?? {}) as { assetId?: unknown };
  if (typeof assetId !== 'string' || !assetId) {
    return NextResponse.json(
      { error: 'Missing assetId' },
      { status: 400 }
    );
  }

  try {
    await deleteAsset(assetId);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to delete' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
