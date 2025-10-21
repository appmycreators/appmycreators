import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import twitchIcon from "@/assets/icones/twitch.svg";

interface TwitchEmbedCardProps {
  url: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Converte URL do Twitch para formato embed
const toEmbedUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    let channel = "";

    // Se já for URL do player
    if (u.hostname === "player.twitch.tv") {
      channel = u.searchParams.get("channel") || "";
      if (!channel) return null;
      
      // Mantém os parents existentes ou usa o domínio atual
      const parents = u.searchParams.getAll("parent");
      const parentParam = parents.length > 0 
        ? parents.map(p => `&parent=${encodeURIComponent(p)}`).join("")
        : `&parent=${encodeURIComponent(window.location.hostname)}`;
      
      return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}${parentParam}`;
    }

    // Se for URL normal do Twitch
    if (u.hostname === "twitch.tv" || u.hostname === "www.twitch.tv") {
      const pathParts = u.pathname.split("/").filter(Boolean);
      channel = pathParts[0] || "";
      if (!channel) return null;

      // Sanitize channel name
      channel = channel.replace(/[^A-Za-z0-9_]/g, "");
      
      return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&parent=${encodeURIComponent(window.location.hostname)}`;
    }

    return null;
  } catch {
    return null;
  }
};

const TwitchEmbedCard = ({ url, onEdit, onDelete }: TwitchEmbedCardProps) => {
  const embed = toEmbedUrl(url);
  
  return (
    <Card className="p-4 bg-white shadow-card border-0 rounded-3xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <img src={twitchIcon} alt="Twitch" className="w-5 h-5" />
          <span className="font-medium text-foreground">Twitch</span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted rounded-full" 
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-muted rounded-full" 
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      {embed ? (
        <iframe
          title="Twitch"
          className="w-full rounded-xl"
          src={embed}
          width="100%"
          height="300"
          frameBorder={0}
          allowFullScreen
          scrolling="no"
          allow="autoplay; fullscreen"
          loading="lazy"
        />
      ) : (
        <div className="h-36 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Link inválido da Twitch
        </div>
      )}
    </Card>
  );
};

export default TwitchEmbedCard;
