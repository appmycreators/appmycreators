import PublicSocialIcon from "./PublicSocialIcon";

/**
 * PublicSocialSection - Seção de redes sociais na página pública
 * Responsabilidade única: Renderizar lista de ícones sociais
 */

const SOCIAL_ORDER = [
  "instagram",
  "facebook", 
  "twitter",
  "tiktok",
  "youtube",
  "spotify",
  "threads",
  "telegram",
  "email",
];

interface PublicSocialSectionProps {
  socials: Record<string, string>;
  socialIconBgColor?: string;
  socialIconColor?: string;
  displayMode?: 'top' | 'bottom';
}

const PublicSocialSection = ({ 
  socials, 
  socialIconBgColor, 
  socialIconColor,
  displayMode = 'top'
}: PublicSocialSectionProps) => {
  const activeSocials = SOCIAL_ORDER.filter(platform => socials[platform]);
  
  if (activeSocials.length === 0) return null;
  
  return (
    <div className={`flex justify-center gap-3 ${displayMode === 'top' ? 'mb-6' : 'mt-6'}`}>
      {activeSocials.map((platform) => (
        <PublicSocialIcon
          key={platform}
          platform={platform}
          url={socials[platform]}
          bgColor={socialIconBgColor}
          iconColor={socialIconColor}
        />
      ))}
    </div>
  );
};

export default PublicSocialSection;
