import { useState } from "react";
import { X, ChevronDown, Palette, Type, Square, Grid3X3, FileText, Zap, Lock, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ColorPicker from "@/components/ui/ColorPicker";
import { useFontSettings } from "@/hooks/useFontSettings";

interface CustomizationModalProps {
  open: boolean;
  onClose: () => void;
  onSelectBackground?: (color: string) => void;
  currentBackground?: string | null;
  onSelectCardBgColor?: (color: string) => void;
  currentCardBgColor?: string | null;
  onSelectCardTextColor?: (color: string) => void;
  currentCardTextColor?: string | null;
  onSelectHeaderNameColor?: (color: string) => void;
  currentHeaderNameColor?: string | null;
  onSelectHeaderBioColor?: (color: string) => void;
  currentHeaderBioColor?: string | null;
  // Gallery colors
  onSelectGalleryTitleColor?: (color: string) => void;
  currentGalleryTitleColor?: string | null;
  onSelectGalleryContainerBgColor?: (color: string) => void;
  currentGalleryContainerBgColor?: string | null;
  onSelectGalleryCardBgColor?: (color: string) => void;
  currentGalleryCardBgColor?: string | null;
  onSelectGalleryProductNameColor?: (color: string) => void;
  currentGalleryProductNameColor?: string | null;
  onSelectGalleryProductDescriptionColor?: (color: string) => void;
  currentGalleryProductDescriptionColor?: string | null;
  onSelectGalleryButtonBgColor?: (color: string) => void;
  currentGalleryButtonBgColor?: string | null;
  onSelectGalleryButtonTextColor?: (color: string) => void;
  currentGalleryButtonTextColor?: string | null;
  onSelectGalleryPriceColor?: (color: string) => void;
  currentGalleryPriceColor?: string | null;
  onSelectGalleryHighlightBgColor?: (color: string) => void;
  currentGalleryHighlightBgColor?: string | null;
  onSelectGalleryHighlightTextColor?: (color: string) => void;
  currentGalleryHighlightTextColor?: string | null;
  // Social media colors
  onSelectSocialIconBgColor?: (color: string) => void;
  currentSocialIconBgColor?: string | null;
  onSelectSocialIconColor?: (color: string) => void;
  currentSocialIconColor?: string | null;
}

const customizationSections = [
  {
    id: "header",
    title: "Cabeçalho da página",
    icon: Zap,
    color: "bg-primary",
  },
  {
    id: "background",
    title: "Cor de fundo", 
    icon: Palette,
    color: "bg-primary",
  },
  {
    id: "font",
    title: "Fonte",
    icon: Type,
    color: "bg-primary",
  },
  {
    id: "link-buttons", 
    title: "Botões de links",
    icon: Square,
    color: "bg-primary",
  },
  {
    id: "product-gallery",
    title: "Galeria de produtos",
    icon: Grid3X3,
    color: "bg-primary",
  },
  {
    id: "text-block",
    title: "Redes Sociais",
    icon: Instagram,
    color: "bg-primary",
  },
];

// Fontes disponíveis com suas configurações
const AVAILABLE_FONTS = [
  { 
    name: "Inter", 
    displayName: "Inter",
    fontFamily: "Inter, sans-serif",
    className: "font-inter"
  },
  { 
    name: "Roboto", 
    displayName: "Roboto",
    fontFamily: "Roboto, sans-serif",
    className: "font-roboto"
  },
  { 
    name: "Open Sans", 
    displayName: "Open Sans",
    fontFamily: "'Open Sans', sans-serif",
    className: "font-opensans"
  },
  { 
    name: "Poppins", 
    displayName: "Poppins",
    fontFamily: "Poppins, sans-serif",
    className: "font-sans" // Já está configurado no Tailwind
  },
  { 
    name: "Montserrat", 
    displayName: "Montserrat",
    fontFamily: "Montserrat, sans-serif",
    className: "font-montserrat"
  }
];

const CustomizationModal = ({ 
  open, 
  onClose, 
  onSelectBackground, 
  currentBackground, 
  onSelectCardBgColor, 
  currentCardBgColor, 
  onSelectCardTextColor, 
  currentCardTextColor, 
  onSelectHeaderNameColor, 
  currentHeaderNameColor, 
  onSelectHeaderBioColor, 
  currentHeaderBioColor,
  onSelectGalleryTitleColor,
  currentGalleryTitleColor,
  onSelectGalleryContainerBgColor,
  currentGalleryContainerBgColor,
  onSelectGalleryCardBgColor,
  currentGalleryCardBgColor,
  onSelectGalleryProductNameColor,
  currentGalleryProductNameColor,
  onSelectGalleryProductDescriptionColor,
  currentGalleryProductDescriptionColor,
  onSelectGalleryButtonBgColor,
  currentGalleryButtonBgColor,
  onSelectGalleryButtonTextColor,
  currentGalleryButtonTextColor,
  onSelectGalleryPriceColor,
  currentGalleryPriceColor,
  onSelectGalleryHighlightBgColor,
  currentGalleryHighlightBgColor,
  onSelectGalleryHighlightTextColor,
  currentGalleryHighlightTextColor,
  onSelectSocialIconBgColor,
  currentSocialIconBgColor,
  onSelectSocialIconColor,
  currentSocialIconColor
}: CustomizationModalProps) => {
  const { fontFamily, updateFontFamily, saveStatus } = useFontSettings();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0 overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="text-center space-y-4 pb-6">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Palette className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <DialogTitle className="text-2xl font-semibold text-foreground mb-2">
                  Customizar página
                </DialogTitle>
                <p className="text-muted-foreground">
                  Customize sua página para combinar com sua marca e salve para aplicar.
                </p>
              </div>
            </DialogHeader>

            <div className="space-y-2">
              <Accordion type="single" collapsible className="w-full">
                {customizationSections.map((section) => (
                  <AccordionItem 
                    key={section.id} 
                    value={section.id}
                    className="border border-border rounded-lg mb-2 px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${section.color} flex items-center justify-center`}>
                          <section.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-foreground text-left">
                          {section.title}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-2">
                      <div className="pl-14">
                        <div className="space-y-3">
                          {section.id === "header" && (
                            <div className="space-y-4">
                              <ColorPicker
                                label="Cor do nome"
                                value={currentHeaderNameColor || undefined}
                                onChange={(color) => onSelectHeaderNameColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor da descrição/bio"
                                value={currentHeaderBioColor || undefined}
                                onChange={(color) => onSelectHeaderBioColor?.(color)}
                              />
                            </div>
                          )}
                          
                          {section.id === "background" && (
                            <div>
                              <ColorPicker
                                label="Cores"
                                value={currentBackground || undefined}
                                onChange={(color) => onSelectBackground?.(color)}
                              />
                              
                            </div>
                          )}
                          
                          {section.id === "link-buttons" && (
                            <div className="space-y-4">
                              <ColorPicker
                                label="Cor de fundo dos cards"
                                value={currentCardBgColor || undefined}
                                onChange={(color) => onSelectCardBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor do texto dos cards"
                                value={currentCardTextColor || undefined}
                                onChange={(color) => onSelectCardTextColor?.(color)}
                              />
                            </div>
                          )}
                          
                          {section.id === "product-gallery" && (
                            <div className="space-y-4">
                              <ColorPicker
                                label="Cor do título da galeria"
                                value={currentGalleryTitleColor || undefined}
                                onChange={(color) => onSelectGalleryTitleColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor de fundo da lista de produtos"
                                value={currentGalleryContainerBgColor || undefined}
                                onChange={(color) => onSelectGalleryContainerBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor de fundo do card"
                                value={currentGalleryCardBgColor || undefined}
                                onChange={(color) => onSelectGalleryCardBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor do nome do produto"
                                value={currentGalleryProductNameColor || undefined}
                                onChange={(color) => onSelectGalleryProductNameColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor da descrição"
                                value={currentGalleryProductDescriptionColor || undefined}
                                onChange={(color) => onSelectGalleryProductDescriptionColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor de fundo do botão"
                                value={currentGalleryButtonBgColor || undefined}
                                onChange={(color) => onSelectGalleryButtonBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor do texto do botão"
                                value={currentGalleryButtonTextColor || undefined}
                                onChange={(color) => onSelectGalleryButtonTextColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor do texto do valor"
                                value={currentGalleryPriceColor || undefined}
                                onChange={(color) => onSelectGalleryPriceColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor de fundo do destaque"
                                value={currentGalleryHighlightBgColor || undefined}
                                onChange={(color) => onSelectGalleryHighlightBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor do texto do destaque"
                                value={currentGalleryHighlightTextColor || undefined}
                                onChange={(color) => onSelectGalleryHighlightTextColor?.(color)}
                              />
                            </div>
                          )}
                          
                          {section.id === "text-block" && (
                            <div className="space-y-4">
                              <ColorPicker
                                label="Cor de fundo dos ícones"
                                value={currentSocialIconBgColor || undefined}
                                onChange={(color) => onSelectSocialIconBgColor?.(color)}
                              />
                              <ColorPicker
                                label="Cor dos ícones"
                                value={currentSocialIconColor || undefined}
                                onChange={(color) => onSelectSocialIconColor?.(color)}
                              />
                            </div>
                          )}
                          
                          {section.id === "font" && (
                            <div className="space-y-2">
                              {AVAILABLE_FONTS.map((font) => (
                                <div 
                                  key={font.name}
                                  onClick={() => updateFontFamily(font.name)}
                                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                                    fontFamily === font.name 
                                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                                      : "border-muted hover:bg-muted/50 hover:border-muted-foreground"
                                  }`}
                                  style={{ fontFamily: font.fontFamily }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <span className="font-medium text-base">
                                        {font.displayName}
                                      </span>
                                      <div className="text-xs text-muted-foreground mt-1" style={{ fontFamily: font.fontFamily }}>
                                        Exemplo de texto com esta fonte
                                      </div>
                                    </div>
                                    {fontFamily === font.name && (
                                      <div className="ml-3 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                        {saveStatus === 'saving' && (
                                          <div className="text-xs text-muted-foreground">Salvando...</div>
                                        )}
                                        {saveStatus === 'saved' && (
                                          <div className="text-xs text-green-600">Salvo!</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizationModal;
