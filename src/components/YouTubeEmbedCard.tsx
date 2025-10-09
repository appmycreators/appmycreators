import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import youtubeIcon from "@/assets/youtube/youtube_form_icon.svg";

interface YouTubeEmbedCardProps {
  url: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const toEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    let videoId = "";

    if (/^(www\.)?youtube\.com$/.test(host)) {
      // Patterns: /watch?v=ID, /shorts/ID, already /embed/ID
      if (u.pathname.startsWith("/watch")) {
        videoId = u.searchParams.get("v") || "";
      } else if (u.pathname.startsWith("/shorts/")) {
        videoId = u.pathname.split("/").filter(Boolean)[1] || "";
      } else if (u.pathname.startsWith("/embed/")) {
        videoId = u.pathname.split("/").filter(Boolean)[1] || "";
      }
    } else if (/^(www\.)?youtu\.be$/.test(host)) {
      // Pattern: /ID
      videoId = u.pathname.split("/").filter(Boolean)[0] || "";
    } else {
      return null;
    }

    // Sanitize video id (YouTube IDs are 11 chars, base64-like, but accept more loosely then slice)
    videoId = (videoId || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
    if (!videoId) return null;

    // Pass through optional start time if present
    const start = u.searchParams.get("t") || u.searchParams.get("start") || "";
    const startParam = start ? `?start=${encodeURIComponent(start.replace(/[^0-9]/g, ""))}` : "";

    return `https://www.youtube.com/embed/${videoId}${startParam}`;
  } catch {
    return null;
  }
};

const YouTubeEmbedCard = ({ url, onEdit, onDelete }: YouTubeEmbedCardProps) => {
  const embed = toEmbedUrl(url);
  return (
    <Card className="p-4 bg-white shadow-card border-0 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={youtubeIcon} alt="YouTube" className="w-5 h-5" />
          <span className="font-medium text-foreground">YouTube</span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted rounded-full" onClick={onDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {embed ? (
        <div className="relative w-full overflow-hidden rounded-xl" style={{ paddingBottom: "56.25%" }}>
          <iframe
            title="YouTube"
            className="absolute inset-0 w-full h-full"
            src={embed}
            frameBorder={0}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-36 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Link inválido do YouTube
        </div>
      )}
    </Card>
  );
};

export default YouTubeEmbedCard;
