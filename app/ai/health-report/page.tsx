"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Zap, Image as ImageIcon, FileVideo } from "lucide-react";
import { FileUploadZone } from "./components/file-upload-zone";

export default function UploadPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Media Upload
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload images and videos with instant preview
          </p>
        </div>

        <Separator className="max-w-xs mx-auto" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Component */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-xl shadow-black/5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl">Upload File</CardTitle>
                <CardDescription>
                  Drag and drop your media file below
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <FileUploadZone />
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card className="border-2 border-primary/10 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Images</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      PNG, JPG, GIF, WebP up to 5MB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileVideo className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Videos</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      MP4, WebM, MOV up to 10MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy First
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your files are processed locally in your browser. No data is
                  transmitted to any server until you explicitly choose to
                  submit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
