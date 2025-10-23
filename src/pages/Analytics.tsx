import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/ui/topbar';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  MousePointerClick,
  Eye,
  Clock,
  TrendingUp,
  Globe,
  Wifi,
  Link as LinkIcon,
} from 'lucide-react';

import { usePageAnalytics } from '@/hooks/useAnalytics';

type Period = '7' | '28' | '90';

// Mapa de códigos de país para flags
const countryFlags: Record<string, string> = {
  'BR': '🇧🇷',
  'US': '🇺🇸',
  'PT': '🇵🇹',
  'AR': '🇦🇷',
  'GB': '🇬🇧',
  'ES': '🇪🇸',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'DE': '🇩🇪',
  'MX': '🇲🇽',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'PE': '🇵🇪',
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const Analytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('7');
  const { data, loading, error } = usePageAnalytics(period);
  
  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Carregando analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl">📊</div>
              <h2 className="text-2xl font-bold text-destructive">Erro ao carregar analytics</h2>
              <p className="text-muted-foreground max-w-md">
                {error?.message || 'Ocorreu um erro ao buscar os dados. Tente novamente mais tarde.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Preparar dados com valores padrão
  const stats = data?.summary || {
    totalViews: 0,
    totalClicks: 0,
    avgCTR: 0,
    avgTimeToClick: 0,
  };
  
  const dailyData = data?.dailyData || [];
  const topLinks = data?.topLinks || [];
  const topCountries = (data?.topCountries || []).map(country => ({
    ...country,
    flag: countryFlags[country.code] || '🌍',
  }));
  const timeToClick = data?.timeToClick || [];
  const topLocations = data?.topLocations || [];

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-8 h-8" />
                  Analytics
                </h1>
                <p className="text-muted-foreground mt-1">
                  Monitore o desempenho da sua página e links
                </p>
              </div>
              <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="28">Últimos 28 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Visitas</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clicks</p>
                    <p className="text-3xl font-bold mt-1">{stats.totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <MousePointerClick className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Click-Through Rate</p>
                    <p className="text-3xl font-bold mt-1">{stats.avgCTR}%</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio p/ Click</p>
                    <p className="text-3xl font-bold mt-1">{stats.avgTimeToClick}s</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visitas e Clicks ao Longo do Tempo */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visitas e Clicks
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="#3b82f6"
                      name="Visitas"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#8b5cf6"
                      name="Clicks"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Tempo até o Click */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Tempo até o Click
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeToClick}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Quantidade" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Links Mais Acessados */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Links Mais Acessados
                </h2>
                <div className="space-y-4">
                  {topLinks.length > 0 ? topLinks.map((link, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{link.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg">{link.clicks.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">clicks</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">Nenhum link foi clicado ainda</p>
                  )}
                </div>
              </Card>

              {/* Top Países */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Top Países
                </h2>
                <div className="space-y-4">
                  {topCountries.length > 0 ? topCountries.map((country, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <p className="font-medium">{country.name}</p>
                          <p className="text-xs text-muted-foreground">{country.code}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{country.visits.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">visitas</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">Nenhuma visita registrada ainda</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Top Localizações (IP + Cidade + País) */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Top Localizações (IP + Cidade)
              </h2>
              <div className="space-y-3">
                {topLocations.length > 0 ? topLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{location.city}, {location.country}</p>
                      <p className="text-xs text-muted-foreground font-mono">{location.ip}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{location.visits}</p>
                      <p className="text-xs text-muted-foreground">visitas</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-muted-foreground py-8">Nenhum IP registrado ainda</p>
                )}
              </div>
            </Card>

            {/* CTR Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribuição de CTR por Dia
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="ctr" name="CTR (%)" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
