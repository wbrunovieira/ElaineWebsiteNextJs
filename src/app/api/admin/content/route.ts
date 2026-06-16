import { NextResponse } from 'next/server';
import { getContentFresh, saveContent } from '@/lib/content';
import { validateContent } from '@/lib/content-schema';

export async function GET() {
  const content = await getContentFresh();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const result = validateContent(body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 422 }
    );
  }

  try {
    await saveContent(result.content);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to save' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
