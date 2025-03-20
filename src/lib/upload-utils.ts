const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB in bytes
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4"];

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Unsupported file type: ${file.type}`;
  }
  return null;
}
