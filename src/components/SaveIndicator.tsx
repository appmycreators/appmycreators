import { Check, Loader2, AlertCircle } from "lucide-react";

interface SaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date | null;
  error?: string;
}

const SaveIndicator = ({ status, lastSaved, error }: SaveIndicatorProps) => {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      {status === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          <span className="text-muted-foreground">Salvando...</span>
        </>
      )}
      
      {status === 'saved' && lastSaved && (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">
            Salvo {formatTimeAgo(lastSaved)}
          </span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-500">{error || 'Erro ao salvar'}</span>
        </>
      )}
    </div>
  );
};

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 5) return 'agora';
  if (seconds < 60) return `há ${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `há ${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours}h`;
  
  return 'há mais de 1 dia';
}

export default SaveIndicator;
