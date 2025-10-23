import { supabase } from '@/lib/supabase';

/**
 * AnalyticsService - Serviço para tracking de page views e resource clicks
 * 
 * Funções principais:
 * - trackPageView: Registra visualização de página
 * - trackResourceClick: Registra click em resource
 */

// ============================================
// HELPER FUNCTIONS - Session & Device Detection
// ============================================

/**
 * Interface para dados de geolocalização
 */
interface GeolocationData {
  ip?: string;
  country_code?: string;
  country_name?: string;
  city?: string;
}

/**
 * Busca geolocalização usando API ipinfo.io
 * Plano Free: 150k requests/mês (muito generoso)
 * Token: 4bcf9605e3afb4
 */
const getGeolocation = async (): Promise<GeolocationData> => {
  try {
    const IPINFO_TOKEN = '4bcf9605e3afb4';
    
    const response = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Geolocation API error:', response.status);
      return {};
    }
    
    const data = await response.json();
    
    // Mapeamento conforme resposta REAL da API ipinfo.io:
    // { ip: "200.162.237.89", country: "BR", city: "São Paulo", region: "São Paulo" }
    
    // Mapa de códigos de país para nomes completos
    const countryNames: Record<string, string> = {
      'BR': 'Brasil',
      'US': 'Estados Unidos',
      'PT': 'Portugal',
      'AR': 'Argentina',
      'GB': 'Reino Unido',
      'ES': 'Espanha',
      'FR': 'França',
      'IT': 'Itália',
      'DE': 'Alemanha',
      'MX': 'México',
      'CL': 'Chile',
      'CO': 'Colômbia',
      'PE': 'Peru',
    };
    
    const countryCode = data.country || null;  // "BR", "US", etc
    
    return {
      ip: data.ip || null,                              // "200.162.237.89"
      country_code: countryCode,                        // "BR"
      country_name: countryNames[countryCode] || countryCode,  // "Brasil"
      city: data.city || null,                          // "São Paulo"
    };
  } catch (error) {
    console.warn('Failed to fetch geolocation:', error);
    return {}; // Retorna vazio se falhar, não bloqueia o tracking
  }
};

/**
 * Gera ou recupera um session ID único para o visitante
 * Armazenado em sessionStorage (dura enquanto a aba está aberta)
 */
const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('mycreators_session_id');
  if (stored) return stored;
  
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  sessionStorage.setItem('mycreators_session_id', sessionId);
  return sessionId;
};

/**
 * Detecta o tipo de dispositivo baseado no User Agent
 */
const getDeviceType = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * Detecta o navegador do usuário
 */
const getBrowser = (): string => {
  const ua = navigator.userAgent;
  
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  
  return 'Other';
};

/**
 * Detecta o sistema operacional
 */
const getOS = (): string => {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  if (/Win/i.test(platform)) return 'Windows';
  if (/Mac/i.test(platform)) return 'MacOS';
  if (/Linux/i.test(platform)) return 'Linux';
  if (/Android/i.test(ua)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  
  return 'Other';
};

// ============================================
// TRACKING FUNCTIONS
// ============================================

/**
 * Rastreia uma visualização de página
 * Chamado quando a PublicPage é carregada
 */
export const trackPageView = async (pageId: string, slug: string) => {
  try {
    const sessionId = generateSessionId();
    
    // Buscar geolocalização (não bloqueia se falhar)
    const geo = await getGeolocation();
    
    const { error } = await supabase
      .from('page_views')
      .insert({
        page_id: pageId,
        session_id: sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        // Geolocalização (IP + País + Cidade)
        ip_address: geo.ip || null,
        country_code: geo.country_code || null,
        country_name: geo.country_name || null,
        city: geo.city || null,
      });
    
    if (error) {
      console.error('Analytics: Failed to track page view', error);
    }
  } catch (err) {
    console.error('Analytics: Exception tracking page view', err);
  }
};

/**
 * Rastreia um click em um resource (link, galeria, whatsapp, etc)
 * 
 * @param pageId - ID da página
 * @param resourceId - ID do resource clicado
 * @param resourceType - Tipo do resource (link, gallery, whatsapp, etc)
 * @param resourceTitle - Título do resource
 * @param resourceUrl - URL do resource (se aplicável)
 * @param pageViewTime - Timestamp de quando a página foi carregada
 */
export const trackResourceClick = async (
  pageId: string,
  resourceId: string,
  resourceType: string,
  resourceTitle: string,
  resourceUrl: string,
  pageViewTime: number
) => {
  try {
    const sessionId = generateSessionId();
    const timeToClick = Math.floor((Date.now() - pageViewTime) / 1000);
    
    const { error } = await supabase
      .from('resource_clicks')
      .insert({
        page_id: pageId,
        resource_id: resourceId,
        resource_type: resourceType,
        resource_title: resourceTitle,
        resource_url: resourceUrl,
        session_id: sessionId,
        time_to_click_seconds: timeToClick,
      });
    
    if (error) {
      console.error('Analytics: Failed to track resource click', error);
    }
  } catch (err) {
    console.error('Analytics: Exception tracking resource click', err);
  }
};

/**
 * Rastreia click em rede social
 */
export const trackSocialClick = async (
  pageId: string,
  platform: string,
  url: string,
  pageViewTime: number
) => {
  try {
    const sessionId = generateSessionId();
    const timeToClick = Math.floor((Date.now() - pageViewTime) / 1000);
    
    // Registrar como resource_click com type 'social'
    // Obs: Não temos resource_id para socials, então usamos um placeholder
    const { error } = await supabase
      .from('resource_clicks')
      .insert({
        page_id: pageId,
        resource_id: '00000000-0000-0000-0000-000000000000', // UUID placeholder
        resource_type: 'social',
        resource_title: platform,
        resource_url: url,
        session_id: sessionId,
        time_to_click_seconds: timeToClick,
      });
    
    if (error) {
      console.error('Analytics: Failed to track social click', error);
    }
  } catch (err) {
    console.error('Analytics: Exception tracking social click', err);
  }
};
