import { usePageSync } from "@/hooks/usePageSync";
import LinkCard from "../LinkCard";

/**
 * WhatsAppBlock - Componente específico para links do WhatsApp
 * Responsabilidade única: Renderizar botões do WhatsApp
 */

interface WhatsAppBlockProps {
  linkId: string;
  onEditLink: (link: any) => void;
  onDeleteLink: (linkId: string) => void;
}

const WhatsAppBlock = ({ linkId, onEditLink, onDeleteLink }: WhatsAppBlockProps) => {
  const { links } = usePageSync();
  
  const link = links.find((l) => l.id === linkId);
  
  if (!link || !link.url.includes("wa.me")) return null;

  return (
    <LinkCard
      title={link.title}
      url={link.url}
      icon={link.icon}
      image={link.image}
      bgColor={link.bgColor}
      hideUrl={true} // WhatsApp sempre esconde URL
      onEdit={() => onEditLink(link)}
      onDelete={() => onDeleteLink(link.id)}
    />
  );
};

export default WhatsAppBlock;
