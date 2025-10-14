import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import PublicContentBlock from "./PublicContentBlock";

/**
 * PublicContentList - Lista de conteúdo da página pública
 * Responsabilidade única: Renderizar lista organizada de conteúdo público
 */

interface PublicContentListProps {
  content: any[];
  cardBgColor?: string;
  cardTextColor?: string;
  onItemClick?: (item: any) => void;
  // Configurações específicas de galeria
  galleryContainerColor?: string;
  galleryTitleColor?: string;
  galleryCardBgColor?: string;
  galleryProductNameColor?: string;
  galleryProductDescriptionColor?: string;
  galleryPriceColor?: string;
  galleryButtonBgColor?: string;
  galleryButtonTextColor?: string;
  galleryHighlightBgColor?: string;
  galleryHighlightTextColor?: string;
}

const PublicContentList = ({ 
  content, 
  cardBgColor, 
  cardTextColor, 
  onItemClick,
  galleryContainerColor,
  galleryTitleColor,
  galleryCardBgColor,
  galleryProductNameColor,
  galleryProductDescriptionColor,
  galleryPriceColor,
  galleryButtonBgColor,
  galleryButtonTextColor,
  galleryHighlightBgColor,
  galleryHighlightTextColor,
}: PublicContentListProps) => {
  const [collapsedGalleries, setCollapsedGalleries] = useState<Set<string>>(new Set());
  const [carouselMod, setCarouselMod] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import("@/components/ui/carousel").then((m) => {
      if (mounted) setCarouselMod(m);
    });
    return () => {
      mounted = false;
    };
  }, []);
  
  const toggleGallery = (galleryId: string) => {
    setCollapsedGalleries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(galleryId)) {
        newSet.delete(galleryId);
      } else {
        newSet.add(galleryId);
      }
      return newSet;
    });
  };

  const CarouselComp = carouselMod?.Carousel;
  const CarouselContentComp = carouselMod?.CarouselContent;
  const CarouselItemComp = carouselMod?.CarouselItem;
  
  if (!content || content.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum conteúdo disponível</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {content.map((item) => {
        // Gallery com items
        if (item.type === 'gallery' && item.items?.length > 0) {
          const isCollapsed = collapsedGalleries.has(item.id);
          
          return (
            <div key={item.id}>
              {/* Gallery Container com fundo */}
              <div 
                className="relative mt-3 pt-4 pb-4 rounded-2xl"
                style={{ backgroundColor: galleryContainerColor || '#282c34' }}
              >
                {/* Gallery Header dentro do container */}
                <div className="flex items-center justify-center relative px-4 sm:px-6 mb-4">
                  <div 
                    className="text-sm font-semibold uppercase text-center"
                    style={{ color: galleryTitleColor || '#ffffff' }}
                  >
                    {item.title}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGallery(item.id)}
                    className="absolute right-4 sm:right-6 p-1 h-8 w-8 text-white hover:bg-white/10"
                  >
                    <motion.div
                      animate={{ rotate: isCollapsed ? 0 : 180 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>
                </div>
                
                {/* Gallery Items */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-6">
                        {!CarouselComp ? (
                          <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-40 rounded-2xl" />
                            <Skeleton className="h-40 rounded-2xl" />
                          </div>
                        ) : (
                          <CarouselComp className="w-full" opts={{ align: "start" }}>
                            <CarouselContentComp>
                              {item.items.map((galleryItem: any) => (
                                <CarouselItemComp key={galleryItem.id} className="basis-[75%] sm:basis-[45%]">
                                  <PublicContentBlock
                                    item={{ ...galleryItem, type: 'gallery_item' }}
                                    cardBgColor={cardBgColor}
                                    cardTextColor={cardTextColor}
                                    onItemClick={onItemClick}
                                    galleryCardBgColor={galleryCardBgColor}
                                    galleryProductNameColor={galleryProductNameColor}
                                    galleryProductDescriptionColor={galleryProductDescriptionColor}
                                    galleryPriceColor={galleryPriceColor}
                                    galleryButtonBgColor={galleryButtonBgColor}
                                    galleryButtonTextColor={galleryButtonTextColor}
                                    galleryHighlightBgColor={galleryHighlightBgColor}
                                    galleryHighlightTextColor={galleryHighlightTextColor}
                                  />
                                </CarouselItemComp>
                              ))}
                            </CarouselContentComp>
                          </CarouselComp>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        }
        
        // Outros tipos de conteúdo
        return (
          <PublicContentBlock
            key={item.id}
            item={item}
            cardBgColor={cardBgColor}
            cardTextColor={cardTextColor}
            onItemClick={onItemClick}
          />
        );
      })}
    </div>
  );
};

export default PublicContentList;
