import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { usePage } from './usePage';

/**
 * Hook para buscar analytics de uma página
 * Usa React Query para cache e revalidação
 */

type Period = '7' | '28' | '90';

interface AnalyticsSummary {
  totalViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  avgCTR: number;
  avgTimeToClick: number;
}

interface DailyData {
  date: string;
  visits: number;
  clicks: number;
  ctr: number;
}

export interface TopLink {
  name: string;
  url: string;
  clicks: number;
}

export interface TopCountry {
  code: string;
  name: string;
  visits: number;
}

export interface TimeToClick {
  range: string;
  count: number;
}

export interface TopLocation {
  ip: string;
  city: string;
  country: string;
  visits: number;
}

export interface AnalyticsData {
  summary: AnalyticsSummary;
  dailyData: DailyData[];
  topLinks: TopLink[];
  topCountries: TopCountry[];
  timeToClick: TimeToClick[];
  topLocations: TopLocation[];
}

/**
 * Hook principal para buscar analytics
 */
export const usePageAnalytics = (period: Period = '7') => {
  const { pageData } = usePage();
  
  const query = useQuery<AnalyticsData>({
    queryKey: ['analytics', pageData.page?.id, period],
    enabled: !!pageData.page?.id,
    queryFn: async () => {
      if (!pageData.page?.id) throw new Error('No active page');
      
      const days = parseInt(period);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase.rpc('get_page_analytics', {
        p_page_id: pageData.page.id,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
      });
      
      if (error) throw error;
      
      // Parse e validação de dados
      return {
        summary: data.summary || {
          totalViews: 0,
          totalClicks: 0,
          uniqueVisitors: 0,
          avgCTR: 0,
          avgTimeToClick: 0,
        },
        dailyData: data.dailyData || [],
        topLinks: data.topLinks || [],
        topCountries: data.topCountries || [],
        timeToClick: data.timeToClick || [],
        topLocations: data.topLocations || [],
      };
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    refetchOnWindowFocus: true,
  });
  
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};

/**
 * Hook para buscar analytics em tempo real (hoje)
 */
export const useRealtimeAnalytics = () => {
  const { pageData } = usePage();
  
  const query = useQuery({
    queryKey: ['analytics-realtime', pageData.page?.id],
    enabled: !!pageData.page?.id,
    queryFn: async () => {
      if (!pageData.page?.id) throw new Error('No active page');
      
      const { data, error } = await supabase.rpc('get_realtime_analytics', {
        p_page_id: pageData.page.id,
      });
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 30, // Cache por 30 segundos
    refetchInterval: 1000 * 60, // Refetch a cada 1 minuto
  });
  
  return {
    data: query.data,
    loading: query.isPending,
    error: query.error,
  };
};
