import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Youtube, Download, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface YouTubeDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadComplete?: () => void;
}

export function YouTubeDownloadDialog({ 
  isOpen, 
  onClose, 
  onDownloadComplete 
}: YouTubeDownloadDialogProps) {
  const { getAuthHeaders } = useAuth();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/transcription/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          url: url.trim(),
          title: title.trim() || undefined,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
          onDownloadComplete?.();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to download YouTube audio");
      }
    } catch (err) {
      setError("Network error occurred. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClose = () => {
    setUrl("");
    setTitle("");
    setError(null);
    setSuccess(false);
    setIsDownloading(false);
    onClose();
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(url);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Download from YouTube
          </DialogTitle>
          <DialogDescription>
            Enter a YouTube video URL to download its audio for transcription
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Download Complete!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The audio has been downloaded and added to your audio files.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isDownloading}
              />
              
              {/* YouTube thumbnail preview */}
              {videoId && (
                <div className="mt-2">
                  <img
                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                    alt="YouTube thumbnail"
                    className="w-full h-32 object-cover rounded-md border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-title">Custom Title (Optional)</Label>
              <Input
                id="custom-title"
                type="text"
                placeholder="Leave empty to use video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isDownloading}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                If left empty, the video's title will be used automatically
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isDownloading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isDownloading || !url.trim()}
                className="min-w-24"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}