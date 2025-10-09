import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface SpotifyEmbedCardProps {
  url: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const toEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (!/^(www\.)?open\.spotify\.com$/i.test(u.hostname)) return null;
    let segments = u.pathname.split("/").filter(Boolean);
    // Remove optional locale prefix like 'intl-pt'
    if (segments[0] && /^intl-[a-z]{2,}/i.test(segments[0])) {
      segments = segments.slice(1);
    }
    // Remove any accidental 'embed' in the source URL path
    if (segments[0] === "embed") {
      segments = segments.slice(1);
    }
    const allowed = new Set(["track", "album", "playlist", "artist", "episode", "show"]);
    const type = segments[0];
    if (!type || !allowed.has(type)) return null;
    let idRaw = segments[1] || "";
    // Strip query/hash remnants and colon suffixes
    idRaw = idRaw.split("?")[0].split(":")[0];
    // Extract first 22 base62 chars (spotify id length)
    const match = idRaw.match(/[A-Za-z0-9]{22}/);
    const id = match ? match[0] : "";
    if (!id) return null;
    return `https://open.spotify.com/embed/${type}/${id}`;
  } catch {
    return null;
  }
};

const SpotifyEmbedCard = ({ url, onEdit, onDelete }: SpotifyEmbedCardProps) => {
  const embed = toEmbedUrl(url);
  return (
    <Card className="p-4 bg-white shadow-card border-0 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src="/images/icones/spotify.svg" alt="Spotify" className="w-5 h-5" />
          <span className="font-medium text-foreground">Spotify</span>
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
        <iframe
          title="Spotify"
          style={{ borderRadius: 12 }}
          src={embed}
          width="100%"
          height="232"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <div className="h-36 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Link inválido do Spotify
        </div>
      )}
    </Card>
  );
};

export default SpotifyEmbedCard;
