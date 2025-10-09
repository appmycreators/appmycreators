import { useState } from "react";
import { X, ChevronDown, Palette, Type, Square, Grid3X3, FileText, Zap, Lock, Instagram } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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

const PRESET_COLORS = [
  "#000000",
  "#282c34",
  "#ffffff",
  "#2F80ED",
  "#7B61FF",
  "#10B981",
  "#FF3EB5",
  "#F3D01C",
  "#F59E0B",
  "#EF4444",
  "#FB7185",
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
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do nome</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectHeaderNameColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentHeaderNameColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do nome ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor da descrição/bio</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectHeaderBioColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentHeaderBioColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor da bio ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {section.id === "background" && (
                            <div>
                              <div className="text-xs text-muted-foreground mb-2">Cores</div>
                              <div className="flex flex-wrap gap-3">
                                {PRESET_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => onSelectBackground?.(color)}
                                    className={`w-9 h-9 rounded-full border ${currentBackground === color ? "ring-2 ring-[#25a3b1]" : "border-muted"}`}
                                    style={{ backgroundColor: color }}
                                    aria-label={`Selecionar cor ${color}`}
                                  />
                                ))}
                              </div>
                              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                                <Lock className="w-4 h-4" />
                                Customizar
                              </div>
                              <div className="mt-2">
                                <button type="button" className="w-9 h-9 rounded-full border border-dashed border-muted flex items-center justify-center text-muted-foreground">+</button>
                              </div>
                            </div>
                          )}
                          {section.id === "link-buttons" && (
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor de fundo dos cards</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectCardBgColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentCardBgColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor de fundo ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do texto dos cards</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectCardTextColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentCardTextColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor de texto ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {section.id === "product-gallery" && (
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do título da galeria</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryTitleColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryTitleColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do título ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor de fundo do card</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryCardBgColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryCardBgColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor de fundo ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do nome do produto</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryProductNameColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryProductNameColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do nome ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor da descrição</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryProductDescriptionColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryProductDescriptionColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor da descrição ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor de fundo do botão</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryButtonBgColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryButtonBgColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do botão ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do texto do botão</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryButtonTextColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryButtonTextColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do texto ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do texto do valor</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryPriceColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryPriceColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do preço ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor de fundo do destaque</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryHighlightBgColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryHighlightBgColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor de fundo do destaque ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor do texto do destaque</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectGalleryHighlightTextColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentGalleryHighlightTextColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do texto do destaque ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {section.id === "text-block" && (
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor de fundo dos ícones</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectSocialIconBgColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentSocialIconBgColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor de fundo ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground mb-2">Cor dos ícones</div>
                                <div className="flex flex-wrap gap-3">
                                  {PRESET_COLORS.map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => onSelectSocialIconColor?.(color)}
                                      className={`w-9 h-9 rounded-full border ${
                                        currentSocialIconColor === color ? "ring-2 ring-[#25a3b1]" : "border-muted"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`Selecionar cor do ícone ${color}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          {section.id === "font" && (
                            <div className="space-y-2">
                              {["Inter", "Roboto", "Open Sans", "Poppins", "Montserrat"].map((font) => (
                                <div 
                                  key={font}
                                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                  <span className="font-medium">{font}</span>
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