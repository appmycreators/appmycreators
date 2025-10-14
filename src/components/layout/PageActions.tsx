import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PageActions - Botões de ação da página
 * Responsabilidade única: Renderizar ações principais (Cores e Editar Cabeçalho)
 */

interface PageActionsProps {
  onCustomization: () => void;
  onEditHeader: () => void;
}

const PageActions = ({ onCustomization, onEditHeader }: PageActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full sm:w-auto gap-2 rounded-full hover:bg-[#00c6a9] hover:text-white"
        onClick={onCustomization}
      >
        🎨 Cores
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full sm:w-auto gap-2 rounded-full hover:bg-[#00c6a9] hover:text-white"
        onClick={onEditHeader}
      >
        <Edit className="w-4 h-4" />
        Editar Cabeçalho
      </Button>
    </div>
  );
};

export default PageActions;
