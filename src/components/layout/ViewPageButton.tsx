import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import eyeIcon from "@/assets/ui/eye.svg";

/**
 * ViewPageButton - Botão fixo para visualizar página
 * Responsabilidade única: Botão de visualização da página pública
 */

interface ViewPageButtonProps {
  username: string;
}

const ViewPageButton = ({ username }: ViewPageButtonProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (username) {
      window.open(`https://mycreators.me/${username}`, '_blank');
    } else {
      toast({
        title: "Aguarde...",
        description: "Carregando suas informações.",
      });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:w-auto pb-[env(safe-area-inset-bottom)]">
      <Button 
        className="w-full md:w-auto justify-center bg-gradient-to-r from-[#00c6a9] via-[#00d4b8] to-[#03816e] bg-[length:200%_100%] text-white shadow-lg gap-2 animate-gradient-x transition-all hover:shadow-xl hover:scale-105"
        size="lg"
        onClick={handleClick}
      >
        <img src={eyeIcon} alt="" className="w-5 h-5" />
        Ver minha página
      </Button>
    </div>
  );
};

export default ViewPageButton;
