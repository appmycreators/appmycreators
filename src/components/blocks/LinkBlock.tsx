import { usePageSync } from "@/hooks/usePageSync";
import SpotifyBlock from "./SpotifyBlock";
import YouTubeBlock from "./YouTubeBlock";
import TwitchBlock from "./TwitchBlock";
import WhatsAppBlock from "./WhatsAppBlock";
import StandardLinkBlock from "./StandardLinkBlock";

/**
 * LinkBlock - Componente coordenador para diferentes tipos de links
 * Responsabilidade única: Determinar qual tipo de link renderizar
 */

interface LinkBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const LinkBlock = ({ linkId, onEditLink, onDeleteLink }: LinkBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link) return null;

  // Renderizar o bloco específico baseado no tipo de URL
  if (link.url.includes("open.spotify.com")) {
    return (
      <SpotifyBlock
        linkId={linkId}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
      />
    );
  }
  
  if (link.url.includes("youtube.com") || link.url.includes("youtu.be")) {
    return (
      <YouTubeBlock
        linkId={linkId}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
      />
    );
  }
  
  if (link.url.includes("twitch.tv") || link.url.includes("player.twitch.tv")) {
    return (
      <TwitchBlock
        linkId={linkId}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
      />
    );
  }
  
  if (link.url.includes("wa.me")) {
    return (
      <WhatsAppBlock
        linkId={linkId}
        onEditLink={onEditLink}
        onDeleteLink={onDeleteLink}
      />
    );
  }
  
  // Link padrão
  return (
    <StandardLinkBlock
      linkId={linkId}
      onEditLink={onEditLink}
      onDeleteLink={onDeleteLink}
    />
  );
};

export default LinkBlock;
