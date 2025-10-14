import { Card } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import { usePageSync } from "@/hooks/usePageSync";
import { useGallerySync } from "@/hooks/useGallerySync";
import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import { usePage } from "@/hooks/usePage";
import LinkCard from "../LinkCard";
import ImageBannerCard from "../ImageBannerCard";
import { FormResource } from "../FormResource";

/**
 * DragPreview - Preview durante o arraste
 * Responsabilidade única: Mostrar preview do item sendo arrastado
 */

interface DragPreviewProps {
  activeId: string | null;
  parseId: (id: string) => { type: string; raw: string };
  cardBgColor?: string;
  cardTextColor?: string;
}

const DragPreview = ({ activeId, parseId, cardBgColor, cardTextColor }: DragPreviewProps) => {
  const { links } = usePageSync();
  const { galleries } = useGallerySync();
  const { imageBanners } = useImageBannerSync();
  const { pageData } = usePage();

  if (!activeId) return null;

  const a = parseId(activeId);

  if (a.type === "gallery") {
    const gallery = galleries.find((g) => g.id === a.raw);
    if (!gallery) return null;
    
    return (
      <Card className="p-4 bg-white shadow-card border-0 rounded-3xl w-[640px] max-w-[90vw]">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground truncate">{gallery.title}</span>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </Card>
    );
  }

  if (a.type === "image_banner") {
    const banner = imageBanners.find((b) => b.id === a.raw);
    if (!banner) return null;
    
    return (
      <div className="w-[640px] max-w-[90vw]">
        <ImageBannerCard
          title={banner.title}
          image={banner.imageUrl}
          url={banner.linkUrl}
          textColor={banner.textColor}
          bgColor={banner.bgColor}
          visibleTitle={banner.visibleTitle}
        />
      </div>
    );
  }

  if (a.type === "link") {
    const link = links.find((l) => l.id === a.raw);
    if (!link) return null;
    
    return (
      <div className="w-[640px] max-w-[90vw]">
        <LinkCard
          title={link.title}
          url={link.url}
          icon={link.icon}
          image={link.image}
          bgColor={link.bgColor}
          hideUrl={Boolean(link.hideUrl) || link.url.includes("wa.me")}
        />
      </div>
    );
  }

  if (a.type === "form") {
    const formResource = pageData.resources?.find((r) => r.id === a.raw && r.type === "form");
    if (!formResource || !formResource.form_data) return null;
    
    return (
      <div className="w-[640px] max-w-[90vw]">
        <FormResource
          formId={formResource.form_data.id}
          formData={formResource.form_data}
          title={formResource.title}
          cardBgColor={cardBgColor}
          cardTextColor={cardTextColor}
        />
      </div>
    );
  }

  return null;
};

export default DragPreview;
