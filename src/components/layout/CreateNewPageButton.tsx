import { Button } from "@/components/ui/button";

/**
 * CreateNewPageButton - Botão para criar nova página Pro
 * Responsabilidade única: Renderizar botão de upgrade Pro
 */

// Função para determinar se a cor é clara ou escura
const isLightColor = (color: string): boolean => {
  if (!color) return false;
  
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5;
};

interface CreateNewPageButtonProps {
  backgroundColor?: string;
  onClick?: () => void;
}

const CreateNewPageButton = ({ backgroundColor, onClick }: CreateNewPageButtonProps) => {
  return (
    <Button 
      variant="outline" 
      className={`w-full h-14 bg-white/20 text-base font-medium ${
        backgroundColor && isLightColor(backgroundColor) 
          ? 'text-black border-black/30 hover:bg-black/10' 
          : 'text-white border-white/30 hover:bg-white/30'
      }`}
      onClick={onClick}
    >
      Criar nova página  Pro ⚡
    </Button>
  );
};

export default CreateNewPageButton;
