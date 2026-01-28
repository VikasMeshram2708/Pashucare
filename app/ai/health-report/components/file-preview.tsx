"use client";

interface FilePreviewProps {
  file: UploadedFile | null;
}

export function FilePreview({ file }: FilePreviewProps) {
  if (!file) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] border rounded-xl bg-muted/30 text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No preview available</p>
          <p className="text-sm">Upload a file to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] border rounded-xl overflow-hidden bg-black/5">
      {file.type === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={file.preview}
          alt="Preview"
          className="w-full h-full object-contain max-h-[500px]"
        />
      ) : (
        <video
          src={file.preview}
          controls
          className="w-full h-full object-contain max-h-[500px]"
          controlsList="nodownload"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
