import { put, del } from '@vercel/blob';

/** Uploads a gallery image and returns its public URL. */
export async function uploadGalleryImage(
  file: File
): Promise<string> {
  const safeName = (file.name || 'photo')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-');
  const blob = await put(`gallery/${safeName}`, file, {
    access: 'public',
    addRandomSuffix: true,
    contentType: file.type,
  });
  return blob.url;
}

/** Deletes a blob by its public URL. */
export async function deleteBlob(url: string): Promise<void> {
  await del(url);
}
