import { usePageSync } from "@/hooks/usePageSync";
import LinkCard from "../LinkCard";

/**
 * StandardLinkBlock - Componente específico para links padrão
 * Responsabilidade única: Renderizar links normais (não Spotify, YouTube ou WhatsApp)
 */

interface StandardLinkBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const StandardLinkBlock = ({ linkId, onEditLink, onDeleteLink }: StandardLinkBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link) return null;
  
  // Não renderizar se for um tipo específico
  if (link.url.includes("open.spotify.com") || 
      link.url.includes("youtube.com") || 
      link.url.includes("youtu.be") || 
      link.url.includes("wa.me")) {
    return null;
  }

  return (
    <LinkCard
      title={link.title}
      url={link.url}
      icon={link.icon}
      image={link.image}
      bgColor={link.bgColor}
      hideUrl={Boolean(link.hideUrl)}
      onEdit={() => onEditLink(link)}
      onDelete={() => onDeleteLink(link.id)}
    />
  );
};

export default StandardLinkBlock;
