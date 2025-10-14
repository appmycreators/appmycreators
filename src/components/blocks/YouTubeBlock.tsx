import { usePageSync } from "@/hooks/usePageSync";
import YouTubeEmbedCard from "../YouTubeEmbedCard";

/**
 * YouTubeBlock - Componente específico para links do YouTube
 * Responsabilidade única: Renderizar embeds do YouTube
 */

interface YouTubeBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const YouTubeBlock = ({ linkId, onEditLink, onDeleteLink }: YouTubeBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link || !(link.url.includes("youtube.com") || link.url.includes("youtu.be"))) return null;

  return (
    <YouTubeEmbedCard
      url={link.url}
      onEdit={() => onEditLink(link)}
      onDelete={() => onDeleteLink(link.id)}
    />
  );
};

export default YouTubeBlock;
