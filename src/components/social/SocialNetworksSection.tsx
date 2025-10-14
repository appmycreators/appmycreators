import { Edit } from "lucide-react";

/**
 * SocialNetworksSection - Seção de redes sociais
 * Responsabilidade única: Renderizar ícones das redes sociais
 */

// Social icons map
const socialIconModules = import.meta.glob("@/assets/icones-redes-sociais/*.svg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

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

const socialIconsMap: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const p in socialIconModules) {
    const name = p.split("/").pop()?.replace(".svg", "");
    if (name) m[name.toLowerCase()] = socialIconModules[p];
  }
  return m;
})();

interface SocialNetworksSectionProps {
  socials: Record<string, string>;
  socialsDisplayMode: 'top' | 'bottom';
  onEdit: () => void;
}

const SocialNetworksSection = ({ socials, socialsDisplayMode, onEdit }: SocialNetworksSectionProps) => {
  // Só renderiza se há redes sociais e modo é bottom
  if (Object.keys(socials).length === 0 || socialsDisplayMode !== "bottom") {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      {SOCIAL_ORDER.filter((p) => Boolean(socials[p])).map((p) => (
        <div key={p} className="w-9 h-9 rounded-full bg-white text-white flex items-center justify-center shadow-sm">
          <img src={socialIconsMap[p]} alt={p} className="w-5 h-5" />
        </div>
      ))}
      <button
        type="button"
        onClick={onEdit}
        className="w-9 h-9 rounded-full bg-white text-foreground flex items-center justify-center shadow-sm border border-border"
        aria-label="Editar redes sociais"
      >
        <Edit className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SocialNetworksSection;
