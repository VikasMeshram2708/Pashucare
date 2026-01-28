type FileType = "image" | "video" | null;

interface UploadedFile {
  file: File;
  preview: string;
  type: FileType;
  size: number;
}

interface FileValidation {
  maxSize: number;
  accept: Record<string, string[]>;
}
