import { useEffect } from "react";
import { usePage } from "@/hooks/usePage";
import { useGallerySync } from "@/hooks/useGallerySync";
import { usePageSync } from "@/hooks/usePageSync";
import { useImageBannerSync } from "@/hooks/useImageBannerSync";
import { BlockOrder } from "./useDragAndDrop";

export const useBlocksOrder = (
  galleries: any[],
  links: any[],
  imageBanners: any[],
  setBlocksOrder: React.Dispatch<React.SetStateAction<BlockOrder[]>>
) => {
  const { pageData } = usePage();

  // Sincroniza blocksOrder com dados atuais baseado no display_order do banco
  useEffect(() => {
    if (!pageData.resources || pageData.resources.length === 0) return;
    const formResources = pageData.resources.filter(r => r.type === 'form');
    if (galleries.length === 0 && links.length === 0 && imageBanners.length === 0 && formResources.length === 0) return;

    console.log('Syncing blocksOrder - galleries:', galleries.length, 'links:', links.length, 'imageBanners:', imageBanners.length, 'forms:', formResources.length);

    // Criar mapa de resources por ID para pegar display_order
    const resourceMap = new Map(
      pageData.resources.map((r) => [r.id, r.display_order])
    );

    // Combinar todos os items com seu display_order
    const allItems = [
      ...galleries.map((g) => ({
        type: "gallery" as const,
        id: g.id,
        order: resourceMap.get(g.id) ?? 9999,
      })),
      ...links.map((l) => ({
        type: "link" as const,
        id: l.id,
        order: resourceMap.get(l.id) ?? 9999,
      })),
      ...imageBanners.map((ib) => ({
        type: "image_banner" as const,
        id: ib.id,
        order: resourceMap.get(ib.id) ?? 9999,
      })),
      ...formResources.map((f) => ({
        type: "form" as const,
        id: f.id,
        order: resourceMap.get(f.id) ?? 9999,
      })),
    ];

    console.log('All items before sort:', allItems);

    // Ordenar por display_order
    allItems.sort((a, b) => a.order - b.order);

    console.log('All items after sort:', allItems);

    // Criar novo blocksOrder
    const newBlocksOrder = allItems.map(({ type, id }) => ({ type, id }));
    
    console.log('Setting blocksOrder to:', newBlocksOrder);
    setBlocksOrder(newBlocksOrder);
  }, [galleries, links, imageBanners, pageData.resources, setBlocksOrder]);
};
