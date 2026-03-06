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

/**
 * Compress an image and return a base64 data URL guaranteed to be
 * under `maxSizeKB` (default 500KB). Quality is reduced iteratively
 * until the target size is met.
 */
export async function compressToBase64(
  file: File,
  maxSizeKB = 500
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  const maxDim = 1200;
  let newWidth = width;
  let newHeight = height;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    newWidth = Math.round(width * ratio);
    newHeight = Math.round(height * ratio);
  }

  const canvas = new OffscreenCanvas(newWidth, newHeight);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, newWidth, newHeight);
  bitmap.close();

  const maxBytes = maxSizeKB * 1024;

  // Try reducing quality until under the size limit
  for (let quality = 0.8; quality >= 0.1; quality -= 0.1) {
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
    if (blob.size <= maxBytes || quality <= 0.1) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }
  }

  // Fallback – return at lowest quality
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.1 });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
}
