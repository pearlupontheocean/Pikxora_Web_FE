import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  type: "embed" | "upload";
  className?: string;
}

const VideoPlayer = ({ url, type, className }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");

  useEffect(() => {
    if (type === "embed") {
      // Convert YouTube/Vimeo URLs to embed format
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.includes("youtu.be") 
          ? url.split("/").pop()?.split("?")[0]
          : new URL(url).searchParams.get("v");
        setEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
      } else if (url.includes("vimeo.com")) {
        const videoId = url.split("/").pop();
        setEmbedUrl(`https://player.vimeo.com/video/${videoId}`);
      } else {
        setEmbedUrl(url);
      }
    }
  }, [url, type]);

  if (type === "embed") {
    return (
      <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden bg-black", className)}>
      <video
        src={url}
        controls
        className="absolute inset-0 w-full h-full object-contain"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
