import { usePageSync } from "@/hooks/usePageSync";
import SpotifyEmbedCard from "../SpotifyEmbedCard";

/**
 * SpotifyBlock - Componente específico para links do Spotify
 * Responsabilidade única: Renderizar embeds do Spotify
 */

interface SpotifyBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const SpotifyBlock = ({ linkId, onEditLink, onDeleteLink }: SpotifyBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link || !link.url.includes("open.spotify.com")) return null;

  return (
    <SpotifyEmbedCard
      url={link.url}
      onEdit={() => onEditLink(link)}
      onDelete={() => onDeleteLink(link.id)}
    />
  );
};

export default SpotifyBlock;
