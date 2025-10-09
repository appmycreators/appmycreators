import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<boolean>;
  delay?: number;
  enabled?: boolean;
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 1000,
  enabled = true,
}: UseAutoSaveOptions<T>) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef<T>(data);
  const { toast } = useToast();

  // Atualizar ref quando data muda
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const save = useCallback(async () => {
    if (!enabled) return;

    setSaving(true);
    
    try {
      const success = await onSave(dataRef.current);
      
      if (success) {
        setLastSaved(new Date());
      } else {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível salvar as alterações',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as alterações',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  }, [enabled, onSave, toast]);

  // Debounce: salvar após delay de inatividade
  useEffect(() => {
    if (!enabled) return;

    // Limpar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Criar novo timeout
    timeoutRef.current = setTimeout(() => {
      save();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, save]);

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    await save();
  }, [save]);

  return {
    saving,
    lastSaved,
    forceSave,
  };
};
