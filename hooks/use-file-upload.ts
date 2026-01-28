import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

export function useFileUpload() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return null;
  };

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file);

    if (!fileType) {
      return "Only images and videos are supported";
    }

    if (fileType === "image" && file.size > MAX_IMAGE_SIZE) {
      return `Image size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    if (fileType === "video" && file.size > MAX_VIDEO_SIZE) {
      return `Video size must be less than 10MB (current: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    const fileType = getFileType(file);
    const preview = URL.createObjectURL(file);

    setUploadedFile({
      file,
      preview,
      type: fileType,
      size: file.size,
    });
  }, []);

  const removeFile = useCallback(() => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setError(null);
  }, [uploadedFile]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "video/*": [".mp4", ".webm", ".mov"],
      },
      maxFiles: 1,
      multiple: false,
    });

  return {
    uploadedFile,
    error,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    removeFile,
  };
}
