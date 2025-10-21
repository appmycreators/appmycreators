import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flowLeadService, type FlowLead } from '@/services/flowLeadService';
import { flowService } from '@/services/flowService';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/ui/topbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  Download, 
  Loader2, 
  Search, 
  Calendar, 
  Mail, 
  Phone, 
  User,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  Monitor,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Flow } from '@/types/flow.types';

export default function FlowLeads() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [flow, setFlow] = useState<Flow | null>(null);
  const [leads, setLeads] = useState<FlowLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<FlowLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<FlowLead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (flowId) {
      loadFlowAndLeads();
    }
  }, [flowId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLeads(leads);
    } else {
      const query = searchTerm.toLowerCase();
      setFilteredLeads(
        leads.filter(
          (lead) =>
            lead.name?.toLowerCase().includes(query) ||
            lead.email?.toLowerCase().includes(query) ||
            lead.phone?.toLowerCase().includes(query) ||
            lead.session_id?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchTerm, leads]);

  const loadFlowAndLeads = async () => {
    if (!flowId) return;

    setLoading(true);
    try {
      // Carregar dados do fluxo
      const flowData = await flowService.getFlow(flowId);
      setFlow(flowData);

      // Carregar leads do fluxo
      const leadsData = await flowLeadService.getFlowLeads(flowId);
      setLeads(leadsData);
      setFilteredLeads(leadsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as informações do fluxo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;

    setIsDeleting(true);
    try {
      await flowLeadService.deleteLead(leadToDelete.id);
      
      toast({
        title: 'Lead excluída',
        description: 'A lead foi removida com sucesso.',
      });

      // Recarregar leads
      await loadFlowAndLeads();
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      toast({
        title: 'Erro ao excluir lead',
        description: 'Não foi possível excluir a lead. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const handleExportCSV = () => {
    if (!flow || leads.length === 0) return;

    // Preparar dados para CSV
    const headers = ['Nome', 'Email', 'Telefone', 'Número', 'IP', 'User Agent', 'Iniciado em', 'Completado em', 'Status', 'Dados Capturados'];
    
    const rows = leads.map(lead => [
      lead.name || '-',
      lead.email || '-',
      lead.phone || '-',
      lead.number_value?.toString() || '-',
      lead.ip_address || '-',
      lead.user_agent || '-',
      new Date(lead.started_at).toLocaleString('pt-BR'),
      lead.completed_at ? new Date(lead.completed_at).toLocaleString('pt-BR') : 'Em andamento',
      lead.completed_at ? 'Completo' : 'Incompleto',
      JSON.stringify(lead.captured_data)
    ]);

    // Criar CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_${flow.flow_name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'CSV exportado!',
      description: 'O arquivo foi baixado com sucesso.',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const completedLeads = leads.filter(lead => lead.completed_at).length;
  const completionRate = leads.length > 0 ? Math.round((completedLeads / leads.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Fluxo não encontrado</h2>
              <Button onClick={() => navigate('/flows')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Fluxos
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/flows')}
                className="mb-4 hover:bg-[#00c6a9]/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Fluxos
              </Button>
              
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                Leads do Fluxo
              </h1>
              <p className="text-muted-foreground mt-1">
                {flow.flow_name}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Leads</p>
                    <p className="text-2xl font-bold text-[#00c6a9]">{leads.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-[#00c6a9]/20" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completos</p>
                    <p className="text-2xl font-bold text-green-600">{completedLeads}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-600/20" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold text-orange-600">{leads.length - completedLeads}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600/20" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-blue-600">{completionRate}%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-blue-600/20" />
                </div>
              </Card>
            </div>

            {/* Leads Table */}
            <Card className="p-6">
              <div className="space-y-4">
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleExportCSV}
                    disabled={leads.length === 0}
                    variant="outline"
                    className="hover:bg-[#00c6a9]/10 hover:text-[#00c6a9] hover:border-[#00c6a9]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>

                {/* Table */}
                {filteredLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'Nenhum lead encontrado com esse critério'
                        : 'Nenhum lead capturado ainda'}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              Nome
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Email
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              Telefone
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              IP
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Data
                            </div>
                          </TableHead>
                          <TableHead>Dados Capturados</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>
                              {lead.completed_at ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completo
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Em andamento
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {lead.name || '-'}
                            </TableCell>
                            <TableCell>{lead.email || '-'}</TableCell>
                            <TableCell>{lead.phone || '-'}</TableCell>
                            <TableCell>
                              <span className="text-xs text-muted-foreground">
                                {lead.ip_address || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(lead.started_at)}
                              </div>
                              {lead.completed_at && (
                                <div className="text-xs text-muted-foreground">
                                  Finalizado: {formatDate(lead.completed_at)}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {Object.keys(lead.captured_data).length > 0 ? (
                                <details className="cursor-pointer">
                                  <summary className="text-sm text-[#00c6a9] hover:underline">
                                    Ver dados ({Object.keys(lead.captured_data).length})
                                  </summary>
                                  <div className="mt-2 text-xs space-y-1 bg-gray-50 p-2 rounded">
                                    {Object.entries(lead.captured_data).map(([key, value]) => (
                                      <div key={key}>
                                        <strong>{key}:</strong> {String(value)}
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setLeadToDelete(lead);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Results Count */}
                {filteredLeads.length > 0 && (
                  <div className="text-sm text-muted-foreground text-center">
                    Mostrando {filteredLeads.length} de {leads.length} leads
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta lead?
              {leadToDelete && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <div><strong>Nome:</strong> {leadToDelete.name || '-'}</div>
                  <div><strong>Email:</strong> {leadToDelete.email || '-'}</div>
                  <div><strong>Telefone:</strong> {leadToDelete.phone || '-'}</div>
                  <div><strong>Iniciado:</strong> {formatDate(leadToDelete.started_at)}</div>
                </div>
              )}
              <p className="mt-3 text-red-600 font-medium">
                Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
