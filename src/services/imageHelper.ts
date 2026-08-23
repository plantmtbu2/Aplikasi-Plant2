/**
 * Helper utility to normalize, format, and compress direct image URLs
 * Supports Google Drive links, Dropbox links, direct HTTP URLs, and Data URLs (base64)
 */

export function formatDirectImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Handle Google Drive Links
  // Types:
  // 1. https://drive.google.com/file/d/1k5s1gmFRSfsJKnOLsFH2WnQVFmEs15ha/view?usp=sharing
  // 2. https://drive.google.com/open?id=1k5s1gmFRSfsJKnOLsFH2WnQVFmEs15ha
  // 3. https://drive.google.com/uc?id=1k5s1gmFRSfsJKnOLsFH2WnQVFmEs15ha
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Handle Dropbox Links (convert dl=0 to raw=1)
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('dl=0', 'raw=1');
  }

  return trimmed;
}

export const DEFAULT_AVATARS = {
  Planner: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  Maintenance: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
};

export function generateSafeUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


/**
 * Resizes and compresses an image File or Base64 string to a compact JPEG data URL.
 * Prevents LocalStorage QuotaExceeded errors while keeping crisp visual quality.
 */
export async function compressImage(
  source: File | string,
  maxDimension = 360,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processImage = (imgSrc: string) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imgSrc);
          return;
        }

        // Fill background white in case of transparent PNGs converting to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          // If canvas export fails (e.g. tainted canvas), fallback to original source
          resolve(imgSrc);
        }
      };

      img.onerror = () => {
        // Fallback to original
        resolve(imgSrc);
      };

      img.src = imgSrc;
    };

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processImage(e.target.result as string);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      // If it's an external URL (e.g. Google Drive or Unsplash), no need to compress with canvas
      if (source.startsWith('http://') || source.startsWith('https://')) {
        resolve(formatDirectImageUrl(source));
        return;
      }
      processImage(source);
    } else {
      resolve('');
    }
  });
}
