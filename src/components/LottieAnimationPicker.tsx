import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import Lottie from "lottie-react";
import { Check } from "lucide-react";

interface LottieAnimationPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (animation: string) => void;
  selectedAnimation?: string;
}

// Carregar todos os arquivos .json da pasta lotties dinamicamente
const lottieFiles = import.meta.glob("@/assets/lotties/*.json", {
  eager: true,
  import: "default",
}) as Record<string, any>;

// Extrair nomes dos arquivos
const availableAnimations = Object.keys(lottieFiles).map((path) => {
  console.log('Lottie path:', path); // Debug
  const fileName = path.split("/").pop()?.replace(".json", "") || "";
  console.log('Extracted fileName:', fileName); // Debug
  return {
    name: fileName,
    data: lottieFiles[path],
  };
});

export default function LottieAnimationPicker({
  open,
  onClose,
  onSelect,
  selectedAnimation,
}: LottieAnimationPickerProps) {
  const [hoveredAnimation, setHoveredAnimation] = useState<string | null>(null);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher Animação</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4">
          {availableAnimations.map((animation) => {
            const isSelected = selectedAnimation === animation.name;
            const isHovered = hoveredAnimation === animation.name;

            return (
              <Card
                key={animation.name}
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  console.log('Selected animation name:', animation.name);
                  onSelect(animation.name);
                }}
                onMouseEnter={() => setHoveredAnimation(animation.name)}
                onMouseLeave={() => setHoveredAnimation(null)}
              >
                <div className="p-4 flex flex-col items-center gap-2">
                  {/* Thumbnail da animação */}
                  <div className="w-24 h-24 flex items-center justify-center bg-muted rounded-lg">
                    <Lottie
                      animationData={animation.data}
                      loop={true}
                      style={{ width: 80, height: 80 }}
                    />
                  </div>

                  {/* Nome da animação */}
                  <div className="text-sm font-medium text-center capitalize">
                    {animation.name.replace(/-/g, " ")}
                  </div>

                  {/* Indicador de seleção */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {availableAnimations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma animação disponível
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
