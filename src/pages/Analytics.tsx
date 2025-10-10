import { useState, useMemo } from 'react';
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

type Period = '7' | '28' | '90';

// Função para gerar dados fictícios
const generateMockData = (period: Period) => {
  const days = parseInt(period);
  const today = new Date();
  
  // Dados de visitas e cliques ao longo do tempo
  const dailyData = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const visits = Math.floor(Math.random() * 300) + 100;
    const clicks = Math.floor(visits * (Math.random() * 0.3 + 0.1)); // 10-40% CTR
    
    return {
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      visits,
      clicks,
      ctr: ((clicks / visits) * 100).toFixed(1),
    };
  });

  // Links mais acessados
  const topLinks = [
    { name: 'Instagram', url: 'instagram.com/..', clicks: Math.floor(Math.random() * 500) + 300 },
    { name: 'WhatsApp', url: 'wa.me/...', clicks: Math.floor(Math.random() * 400) + 250 },
    { name: 'Produto Premium', url: 'loja.com/produto', clicks: Math.floor(Math.random() * 350) + 200 },
    { name: 'YouTube Channel', url: 'youtube.com/...', clicks: Math.floor(Math.random() * 300) + 150 },
    { name: 'TikTok Profile', url: 'tiktok.com/@...', clicks: Math.floor(Math.random() * 280) + 120 },
  ].sort((a, b) => b.clicks - a.clicks);

  // Top países
  const topCountries = [
    { name: 'Brasil', code: 'BR', visits: Math.floor(Math.random() * 1500) + 800, flag: '🇧🇷' },
    { name: 'Estados Unidos', code: 'US', visits: Math.floor(Math.random() * 800) + 300, flag: '🇺🇸' },
    { name: 'Portugal', code: 'PT', visits: Math.floor(Math.random() * 500) + 200, flag: '🇵🇹' },
    { name: 'Argentina', code: 'AR', visits: Math.floor(Math.random() * 400) + 150, flag: '🇦🇷' },
    { name: 'Reino Unido', code: 'GB', visits: Math.floor(Math.random() * 300) + 100, flag: '🇬🇧' },
  ].sort((a, b) => b.visits - a.visits);

  // Top IPs (dados fictícios para privacidade)
  const topIPs = [
    { ip: '187.120.45.***', visits: Math.floor(Math.random() * 50) + 20, city: 'São Paulo' },
    { ip: '201.45.78.***', visits: Math.floor(Math.random() * 40) + 15, city: 'Rio de Janeiro' },
    { ip: '179.234.12.***', visits: Math.floor(Math.random() * 35) + 10, city: 'Belo Horizonte' },
    { ip: '200.156.89.***', visits: Math.floor(Math.random() * 30) + 8, city: 'Brasília' },
    { ip: '191.78.234.***', visits: Math.floor(Math.random() * 25) + 5, city: 'Curitiba' },
  ].sort((a, b) => b.visits - a.visits);

  // Tempo até o click (em segundos)
  const timeToClick = [
    { range: '0-5s', count: Math.floor(Math.random() * 300) + 100 },
    { range: '6-10s', count: Math.floor(Math.random() * 250) + 80 },
    { range: '11-30s', count: Math.floor(Math.random() * 200) + 60 },
    { range: '31-60s', count: Math.floor(Math.random() * 150) + 40 },
    { range: '60s+', count: Math.floor(Math.random() * 100) + 20 },
  ];

  // Totais
  const totalVisits = dailyData.reduce((sum, day) => sum + day.visits, 0);
  const totalClicks = dailyData.reduce((sum, day) => sum + day.clicks, 0);
  const avgCTR = ((totalClicks / totalVisits) * 100).toFixed(1);
  const avgTimeToClick = (Math.random() * 20 + 10).toFixed(1); // 10-30 segundos

  return {
    dailyData,
    topLinks,
    topCountries,
    topIPs,
    timeToClick,
    stats: {
      totalVisits,
      totalClicks,
      avgCTR,
      avgTimeToClick,
    },
  };
};

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const Analytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('7');

  const data = useMemo(() => generateMockData(period), [period]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
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
                    <p className="text-3xl font-bold mt-1">{data.stats.totalVisits.toLocaleString()}</p>
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
                    <p className="text-3xl font-bold mt-1">{data.stats.totalClicks.toLocaleString()}</p>
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
                    <p className="text-3xl font-bold mt-1">{data.stats.avgCTR}%</p>
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
                    <p className="text-3xl font-bold mt-1">{data.stats.avgTimeToClick}s</p>
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
                  <LineChart data={data.dailyData}>
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
                  <BarChart data={data.timeToClick}>
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
                  {data.topLinks.map((link, index) => (
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
                  ))}
                </div>
              </Card>

              {/* Top Países */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Top Países
                </h2>
                <div className="space-y-4">
                  {data.topCountries.map((country, index) => (
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
                  ))}
                </div>
              </Card>
            </div>

            {/* Top IPs */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Top IPs (Dados Anonimizados)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {data.topIPs.map((ipData, index) => (
                  <Card key={index} className="p-4 border-2">
                    <div className="text-center">
                      <p className="font-mono text-sm font-semibold">{ipData.ip}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ipData.city}</p>
                      <p className="text-2xl font-bold text-primary mt-2">{ipData.visits}</p>
                      <p className="text-xs text-muted-foreground">visitas</p>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* CTR Distribution */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribuição de CTR por Dia
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyData}>
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
