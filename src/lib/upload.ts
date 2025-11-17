import { uploadFile as uploadFileAPI } from "./api";

export interface UploadProgress {
  progress: number;
  fileName: string;
}

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // Simulate progress for better UX
    if (onProgress) {
      const progressInterval = setInterval(() => {
        onProgress({ progress: Math.random() * 50, fileName: file.name });
      }, 300);

      setTimeout(() => clearInterval(progressInterval), 2000);
    }

    const response = await uploadFileAPI(file, folder);

    if (onProgress) {
      onProgress({ progress: 100, fileName: file.name });
    }

    return { url: response.url, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  bucket: string,
  filePath: string
): Promise<{ error: Error | null }> => {
  // File deletion can be implemented if needed
  return { error: null };
};
