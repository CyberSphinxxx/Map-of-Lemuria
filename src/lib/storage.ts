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
  let finalFileName = fileName.replace(/[^a-zA-Z0-0.\-_]/g, '_');
  let finalContentType = contentType;

  // 1. Attempt WebP compression if it's an image
  if (contentType.startsWith('image/') && !contentType.includes('svg')) {
    try {
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80 })
        .toBuffer();
      
      // Update extension to .webp
      const lastDotIndex = finalFileName.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        finalFileName = finalFileName.substring(0, lastDotIndex) + ".webp";
      } else {
        finalFileName = finalFileName + ".webp";
      }
      finalContentType = 'image/webp';
    } catch (sharpError) {
      console.warn('[Storage] Sharp compression failed, falling back to original:', sharpError);
      // Fallback: finalBuffer remains original buffer
    }
  }

  // 2. Upload to Vercel Blob
  const { url } = await put(finalFileName, finalBuffer, {
    access: 'public',
    contentType: finalContentType,
  });

  return url;
}
