import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsernameService } from "@/services/supabaseService";
import { Loader2 } from "lucide-react";

const Preview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const redirectToPublicProfile = async () => {
      if (!user) {
        // Se não estiver logado, redirecionar para login
        navigate('/login');
        return;
      }

      try {
        // Obter username do usuário
        const username = await UsernameService.getUserUsername(user.id);

        if (username) {
          // Redirecionar para página pública
          navigate(`/${username}`);
        } else {
          console.error('Username não encontrado');
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading username:', error);
        navigate('/');
      }
    };

    redirectToPublicProfile();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Carregando preview...</p>
      </div>
    </div>
  );
};

export default Preview;