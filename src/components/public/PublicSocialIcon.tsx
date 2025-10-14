import { useEffect, useState } from "react";
import { Instagram } from "lucide-react";

/**
 * PublicSocialIcon - Ícone social com lazy loading
 * Responsabilidade única: Renderizar ícone social com carregamento otimizado
 */

// Lazy load de ícones sociais individualmente
const getSocialIcon = async (platform: string): Promise<string | null> => {
  try {
    const module = await import(`@/assets/icones-redes-sociais/${platform.toLowerCase()}.svg`);
    return module.default;
  } catch (error) {
    return null;
  }
};

interface PublicSocialIconProps {
  platform: string;
  url: string;
  bgColor?: string;
  iconColor?: string;
}

const PublicSocialIcon = ({ platform, url, bgColor, iconColor }: PublicSocialIconProps) => {
  const [iconSrc, setIconSrc] = useState<string | null>(null);
  
  useEffect(() => {
    getSocialIcon(platform).then(setIconSrc);
  }, [platform]);
  
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 hover:scale-110"
      style={{ backgroundColor: bgColor || '#e5e7eb' }}
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={platform}
          className="w-5 h-5"
          style={{
            filter: iconColor ? 'brightness(0) saturate(100%)' : undefined,
            opacity: iconColor ? 1 : undefined,
          }}
        />
      ) : (
        <Instagram className="w-5 h-5" style={{ color: iconColor || undefined }} />
      )}
    </a>
  );
};

export default PublicSocialIcon;
