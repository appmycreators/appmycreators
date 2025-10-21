import { usePageSync } from "@/hooks/usePageSync";
import TwitchEmbedCard from "../TwitchEmbedCard";

/**
 * TwitchBlock - Componente específico para links da Twitch
 * Responsabilidade única: Renderizar embeds da Twitch
 */

interface TwitchBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const TwitchBlock = ({ linkId, onEditLink, onDeleteLink }: TwitchBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link || !(link.url.includes("twitch.tv") || link.url.includes("player.twitch.tv"))) return null;

  return (
    <TwitchEmbedCard
      url={link.url}
      onEdit={() => onEditLink(link)}
      onDelete={() => onDeleteLink(link.id)}
    />
  );
};

export default TwitchBlock;
