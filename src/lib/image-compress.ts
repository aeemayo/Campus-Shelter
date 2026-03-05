/**
 * Client-side image compression utility.
 * Resizes and compresses images before upload to reduce storage and bandwidth.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: string;
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  mimeType: "image/jpeg",
};

/**
 * Compress an image File, returning a new (smaller) File.
 * Falls back to the original file for non-image types (e.g. PDF).
 */
export async function compressImage(
  file: File,
  opts?: CompressOptions
): Promise<File> {
  // Skip non-image files (e.g. PDF ID cards)
  if (!file.type.startsWith("image/")) return file;

  const { maxWidth, maxHeight, quality, mimeType } = { ...DEFAULTS, ...opts };

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Calculate new dimensions maintaining aspect ratio
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  // If image is already small enough and under 500KB, skip compression
  if (newWidth === width && newHeight === height && file.size < 500 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: mimeType, quality });

  // If compression made it larger, keep original
  if (blob.size >= file.size) return file;

  const ext = mimeType === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, `.${ext}`);
  return new File([blob], name, { type: mimeType, lastModified: Date.now() });
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  opts?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, opts)));
}
