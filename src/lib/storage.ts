import { put } from '@vercel/blob';
import sharp from 'sharp';

/**
 * Uploads a file to Vercel Blob and returns the public URL.
 * Supports automatic WebP compression for images.
 */
export async function uploadToBlob(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  let finalBuffer = buffer;
  let finalFileName = fileName;

  // Compress to WebP if it's an image
  if (contentType.startsWith('image/')) {
    finalBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .toBuffer();
    // Rename to .webp
    finalFileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
  }

  const { url } = await put(finalFileName, finalBuffer, {
    access: 'public',
    contentType: contentType.startsWith('image/') ? 'image/webp' : contentType,
  });

  return url;
}
