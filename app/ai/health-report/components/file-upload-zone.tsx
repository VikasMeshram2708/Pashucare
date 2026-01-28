"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileImage,
  Film,
  AlertCircle,
  ZoomIn,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FileType = "image" | "video";

interface UploadedFile {
  file: File;
  preview: string;
  type: FileType;
  size: number;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFileType = (file: File): FileType | null => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    return null;
  };

  const validateFile = (file: File): string | null => {
    const fileType = getFileType(file);

    if (!fileType) {
      return "Only images (PNG, JPG, GIF, WebP) and videos (MP4, WebM, MOV) are supported";
    }

    if (fileType === "image" && file.size > MAX_IMAGE_SIZE) {
      return `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 5MB`;
    }

    if (fileType === "video" && file.size > MAX_VIDEO_SIZE) {
      return `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 10MB`;
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

    const fileType = getFileType(file)!;
    const preview = URL.createObjectURL(file);

    setUploadedFile({
      file,
      preview,
      type: fileType,
      size: file.size,
    });
  }, []);

  const removeFile = () => {
    if (uploadedFile?.preview) {
      URL.revokeObjectURL(uploadedFile.preview);
    }
    setUploadedFile(null);
    setError(null);
    setIsPreviewOpen(false);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
        "video/*": [".mp4", ".webm", ".mov", ".quicktime"],
      },
      maxFiles: 1,
      multiple: false,
      noClick: !!uploadedFile, // Prevent click when file exists
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Upload/Display Area */}
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[280px] border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
            "hover:border-primary/50 hover:bg-muted/30",
            isDragActive && "border-primary bg-primary/5 scale-[1.01]",
            isDragReject && "border-destructive bg-destructive/5",
            error && "border-destructive bg-destructive/5",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          )}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div
              className={cn(
                "p-4 rounded-full bg-muted transition-all duration-300",
                isDragActive && "scale-110 bg-primary/10",
              )}
            >
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <p className="text-xl font-semibold text-foreground">
                {isDragActive ? "Drop it here" : "Drag & drop your file"}
              </p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary font-medium">browse</span> to
                choose a file
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <FileImage className="w-3.5 h-3.5" />
                <span>Images max 5MB</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                <Film className="w-3.5 h-3.5" />
                <span>Videos max 10MB</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full">
          {/* Success State - File Info */}
          <div className="flex flex-col items-center justify-center w-full min-h-[120px] border rounded-xl bg-muted/20 p-6 mb-6">
            <div className="flex items-center gap-4 w-full">
              <div
                className={cn(
                  "p-3 rounded-lg",
                  uploadedFile.type === "image"
                    ? "bg-blue-500/10"
                    : "bg-purple-500/10",
                )}
              >
                {uploadedFile.type === "image" ? (
                  <FileImage className="w-6 h-6 text-blue-600" />
                ) : (
                  <Film className="w-6 h-6 text-purple-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-foreground">
                  {uploadedFile.file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)} •{" "}
                  {uploadedFile.file.type.split("/")[1].toUpperCase()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => open()}
                  className="hidden sm:flex"
                >
                  Change
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={removeFile}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Thumbnail - Beneath Upload Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <p className="text-xs text-muted-foreground">Click to enlarge</p>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger>
                <div
                  className={cn(
                    "relative group cursor-pointer rounded-xl overflow-hidden border-2 border-transparent",
                    "bg-black/5 dark:bg-white/5",
                    "transition-all duration-300",
                    "hover:border-primary/50 hover:shadow-lg",
                    "active:scale-[0.99]",
                  )}
                >
                  {/* Thumbnail Container */}
                  <div className="relative aspect-video max-h-[240px] flex items-center justify-center bg-black/5">
                    {uploadedFile.type === "image" ? (
                      <img
                        src={uploadedFile.preview}
                        alt="Preview thumbnail"
                        className="w-full h-full object-contain max-h-[240px]"
                      />
                    ) : (
                      <video
                        src={uploadedFile.preview}
                        className="w-full h-full object-contain max-h-[240px]"
                        preload="metadata"
                      />
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end pb-6">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-full mb-2">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-white text-sm font-medium">
                        Click to view full size
                      </span>
                    </div>
                  </div>
                </div>
              </DialogTrigger>

              {/* Full Screen Modal */}
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95 border-none rounded-2xl">
                <DialogHeader className="absolute top-0 left-0 right-0 z-50 p-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                  <DialogTitle className="text-white flex items-center justify-between text-lg pointer-events-auto">
                    <span className="truncate pr-8 drop-shadow-md">
                      {uploadedFile.file.name}
                    </span>
                    <span className="text-sm font-normal text-white/80 shrink-0">
                      {formatFileSize(uploadedFile.size)}
                    </span>
                  </DialogTitle>
                </DialogHeader>

                <div className="flex items-center justify-center min-h-[300px] h-[90vh] p-2">
                  {uploadedFile.type === "image" ? (
                    <img
                      src={uploadedFile.preview}
                      alt="Full size preview"
                      className="max-w-full max-h-full object-contain rounded-lg"
                      onClick={() => setIsPreviewOpen(false)}
                    />
                  ) : (
                    <video
                      src={uploadedFile.preview}
                      controls
                      autoPlay
                      className="max-w-full max-h-full rounded-lg"
                      controlsList="nodownload"
                    >
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Mobile Actions - Only show on small screens */}
            <div className="flex gap-2 sm:hidden mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => open()}
              >
                Change File
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={removeFile}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
