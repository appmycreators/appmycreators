import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface TemplatePreviewData {
  template: any;
  settings: any;
  resources: any[];
  social_networks: any[];
}

export const useTemplatePreview = (templateId: string | null) => {
  return useQuery({
    queryKey: ['templatePreview', templateId],
    enabled: !!templateId,
    queryFn: async () => {
      if (!templateId) return null;

      const { data, error } = await supabase.rpc('get_template_full_data', {
        p_template_id: templateId,
      });

      if (error) {
        console.error('Error fetching template preview:', error);
        throw error;
      }

      return data as TemplatePreviewData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
};
