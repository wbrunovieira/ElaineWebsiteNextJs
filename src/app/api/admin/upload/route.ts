import { NextResponse } from 'next/server';
import { uploadGalleryImage } from '@/lib/blob';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
// Files arrive already compressed client-side; cap well under Vercel's
// 4.5MB request-body limit for server routes.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported type: ${file.type}` },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'File too large' },
      { status: 413 }
    );
  }

  try {
    const url = await uploadGalleryImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || 'Upload failed' },
      { status: 502 }
    );
  }
}
