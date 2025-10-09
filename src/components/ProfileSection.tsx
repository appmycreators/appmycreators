import { Plus, Edit2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { GalleryItem } from "./GalleryItemForm";
import Lottie from "lottie-react";

// Carregar todas as animações Lottie dinamicamente
const lottieAnimations = import.meta.glob("@/assets/lotties/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

interface ProfileSectionProps {
  title?: string;
  items: GalleryItem[];
  onAdd?: () => void;
  onEdit?: (item: GalleryItem) => void;
  onRename?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  highlightBgColor?: string | null;
  highlightTextColor?: string | null;
}

const ProfileSection = ({ title = "Minha galeria", items, onAdd, onEdit, onRename, collapsed = false, onToggleCollapse, highlightBgColor, highlightTextColor }: ProfileSectionProps) => {
  const formatPrice = (price: number | string | null | undefined) => {
    if (!price) return '';
    
    // Se for number, assume que está em centavos
    if (typeof price === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price / 100);
    }
    
    // Se for string, tenta fazer parse
    const num = parseFloat(price.replace(/[^0-9,.-]/g, '').replace(',', '.'));
    if (isNaN(num)) return price;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Card className={`p-6 bg-white shadow-card border-0 rounded-3xl ${collapsed ? "min-h-[80px]" : ""}`}>
      <Collapsible open={!collapsed} onOpenChange={() => onToggleCollapse?.()}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{title}</span>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent"
                aria-label={collapsed ? "Expandir galeria" : "Recolher galeria"}
              >
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "-rotate-180" : "rotate-0"}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-transparent"
            onClick={onRename}
            aria-label="Renomear galeria"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Items da galeria com animação */}
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl overflow-hidden border border-border/60 bg-white shadow-card">
                  <div className="relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full aspect-[4/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[4/3] bg-muted" />
                    )}
                    {item.destaque && (
                      <div 
                        className="absolute top-2 left-2 z-20 text-[10px] font-extrabold px-2 py-1 rounded-full shadow neon-highlight-badge"
                        style={{
                          backgroundColor: highlightBgColor || '#fbbf24',
                          color: highlightTextColor || '#000000',
                          boxShadow: '0 0 12px rgba(59, 130, 246, 0.45)',
                        }}
                      >
                        DESTAQUE
                      </div>
                    )}
                    {item.lottieAnimation && (() => {
                      const animationPath = `/src/assets/lotties/${item.lottieAnimation}.json`;
                      const animationData = lottieAnimations[animationPath];
                      
                      return animationData ? (
                        <div className="absolute top-2 right-2 z-10 w-12 h-12 pointer-events-none">
                          <Lottie 
                            animationData={animationData} 
                            loop={true} 
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : null;
                    })()}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 bg-white/90 text-zinc-900 hover:bg-white/90 hover:text-zinc-900 transition-none [&_svg]:opacity-100 z-20"
                        onClick={() => onEdit(item)}
                        aria-label="Editar item"
                      >
                        <Edit2 className="w-4 h-4 text-zinc-900" />
                      </Button>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-foreground truncate">{item.name}</div>
                      {item.price && (
                        <div className="text-sm font-bold text-foreground whitespace-nowrap">
                          {formatPrice(item.price)}
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <Button variant="dark" className="mt-2 w-full h-9 rounded-full" asChild>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">{item.buttonText || "Saiba Mais"}</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-4">Nenhum produto adicionado ainda.</div>
          )}

          {/* Botão Adicionar dentro da galeria */}
          <Button variant="dark" className="w-full gap-2 rounded-full" onClick={onAdd}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ProfileSection;