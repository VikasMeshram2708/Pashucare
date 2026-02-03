"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileTextIcon,
  XIcon,
  UploadCloudIcon,
  CheckCircle2,
  Stethoscope,
  Loader2,
  CheckCircleIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assistantProseClasses } from "../components/message-list";
import { isValidConvexId } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024;

interface UploadAreaProps {
  userId: string;
  chatId?: Id<"chats">;
}

export default function UploadArea({ chatId }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateUploadUrl = useMutation(api.uploader.generateUploadUrl);
  const saveReport = useMutation(api.uploader.saveReport);
  const saveAnalysis = useMutation(api.uploader.saveAnalysis);

  const validate = (f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF documents allowed");
      return false;
    }
    if (f.size > MAX_SIZE) {
      toast.error("File exceeds 5MB");
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && validate(selected)) setFile(selected);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setAnalysis("");

    try {
      const postUrl = await generateUploadUrl();
      const uploadRes = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      const { storageId } = await uploadRes.json();

      // Start analysis first. We will save the report ONLY if analysis starts successfully.
      const analysisResult = await handleAnalyze(storageId);

      if (analysisResult) {
        toast.success("Report uploaded and analysis started");
        setFile(null);
      }
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const formatSize = (bytes: number) =>
    (bytes / 1024 / 1024).toFixed(2) + " MB";

  async function handleAnalyze(storageId?: Id<"_storage">) {
    if (!file) return null;

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const formData = new FormData();
      formData.append("report-file", file);

      const response = await fetch("/api/report/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.status === 429) {
        toast.error(
          "The engine is currently overloaded, please try again later",
        );
        return null;
      }
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start analysis");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // If we have a storageId, it means we're in the initial upload flow.
      // Save the report record now that we know analysis has started.
      let reportId: Id<"reports"> | undefined;
      if (storageId) {
        const validatedChatId = isValidConvexId(chatId) ? chatId : undefined;
        reportId = await saveReport({
          chatId: validatedChatId,
          fileId: storageId,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullAnalysis = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullAnalysis += chunk;
        setAnalysis(fullAnalysis);
      }

      // Once streaming is complete, save the final analysis to the database
      if (reportId) {
        await saveAnalysis({
          reportId,
          analysis: fullAnalysis,
        });
      }

      toast.success("Analysis Complete", {
        description: "AI report analysis has been generated successfully.",
        icon: <CheckCircleIcon className="h-4 w-4" />,
      });

      return fullAnalysis;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section
      className={cn(
        "flex flex-col gap-6 transition-all duration-500",
        analysis || isAnalyzing
          ? "md:flex-row items-start"
          : "items-center justify-center py-10",
      )}
    >
      <Card
        className={cn(
          "w-full transition-all duration-500 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40",
          analysis || isAnalyzing ? "md:max-w-md" : "max-w-2xl",
          isAnalyzing && "ring-2 ring-primary/20",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Stethoscope className="w-5 h-5 text-primary" />
            Medical Report Upload
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {!file ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <UploadCloudIcon className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Upload your {"pet's"} medical report
                </p>
                <p className="text-xs text-muted-foreground">
                  Select a PDF file to continue
                </p>
              </div>
              <Input
                type="file"
                ref={inputRef}
                onChange={handleChange}
                accept="application/pdf"
                className="hidden"
                name="report-file"
              />
              <Button
                onClick={() => inputRef.current?.click()}
                className="rounded-full px-6"
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Select PDF
              </Button>
              <p className="text-xs text-muted-foreground">
                PDF only • Max 5MB
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <div className="w-12 h-12 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                  <FileTextIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatSize(file.size)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => !isUploading && setFile(null)}
                  disabled={isUploading}
                  className="p-1.5 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive disabled:opacity-50"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10"
                  onClick={() => setFile(null)}
                  disabled={isUploading}
                >
                  Change
                </Button>
                <Button
                  className="flex-1 h-10"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading && (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  )}
                  {isUploading ? "Uploading..." : "Upload Report"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streaming Analysis Area */}
      {(analysis || isAnalyzing) && (
        <Card className="flex-1 w-full animate-in fade-in slide-in-from-right-4 duration-500 overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Loader2
                className={cn(
                  "w-4 h-4 text-primary",
                  isAnalyzing && "animate-spin",
                )}
              />
              {isAnalyzing
                ? "AI is analyzing your report..."
                : "Analysis Results"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px] p-6">
              {/* Here */}
              <div className={assistantProseClasses}>
                <Markdown remarkPlugins={[remarkGfm]}>{analysis}</Markdown>
                {isAnalyzing && !analysis && (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                    <p className="text-sm animate-pulse">
                      Extracting and analyzing laboratory data...
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
