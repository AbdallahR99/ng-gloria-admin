export interface ImageResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface ResizedImageResult {
  base64: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  originalSize: number;
  compressionRatio: number;
}

/**
 * Resize and compress images before uploading
 * Reduces file size while maintaining acceptable quality
 */
export function resizeImage(
  file: File,
  options: ImageResizeOptions = {}
): Promise<ResizedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const base64 = canvas.toDataURL(outputFormat, quality);

      // Calculate file size from base64 string
      const base64Data = base64.split(',')[1];
      const byteLength = Math.round((base64Data.length * 3) / 4);

      // Calculate compression ratio
      const compressionRatio = ((file.size - byteLength) / file.size) * 100;

      resolve({
        base64,
        fileName: file.name,
        fileType: outputFormat,
        fileSize: byteLength,
        originalSize: file.size,
        compressionRatio: Math.max(0, compressionRatio),
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize multiple images
 */
export function resizeImages(
  files: File[] | FileList,
  options: ImageResizeOptions = {}
): Promise<ResizedImageResult[]> {
  const fileArray = Array.from(files);
  return Promise.all(fileArray.map((file) => resizeImage(file, options)));
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validate image file before processing
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 10
): { isValid: boolean; error?: string } {
  if (!isImageFile(file)) {
    return { isValid: false, error: 'File must be an image' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}
