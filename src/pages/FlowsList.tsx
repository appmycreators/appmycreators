import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Workflow, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Loader2,
  Calendar,
  MoreVertical,
  Pencil,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Topbar from '@/components/ui/topbar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { flowService } from '@/services/flowService';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import type { Flow } from '@/types/flow.types';

export default function FlowsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [flows, setFlows] = useState<Flow[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<Flow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [flowToDelete, setFlowToDelete] = useState<Flow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [flowToEdit, setFlowToEdit] = useState<Flow | null>(null);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pages, setPages] = useState<Array<{ id: string; title: string; slug: string }>>([]);

  // Carregar fluxos e páginas
  useEffect(() => {
    loadFlows();
    loadPages();
  }, []);

  // Filtrar fluxos quando a busca mudar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredFlows(flows);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredFlows(
        flows.filter(
          (flow) =>
            flow.flow_name.toLowerCase().includes(query) ||
            flow.description?.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, flows]);

  const loadPages = async () => {
    try {
      const data = await flowService.getUserPages();
      setPages(data);
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    }
  };

  const loadFlows = async () => {
    setIsLoading(true);
    try {
      const data = await flowService.getUserFlows();
      
      // Buscar page_id de cada flow que tem resource_id
      const flowsWithPageId = await Promise.all(
        data.map(async (flow) => {
          if (flow.resource_id) {
            const { data: resource } = await supabase
              .from('resources')
              .select('page_id')
              .eq('id', flow.resource_id)
              .single();
            
            return { ...flow, page_id: resource?.page_id };
          }
          return flow;
        })
      );
      
      setFlows(flowsWithPageId);
      setFilteredFlows(flowsWithPageId);
    } catch (error) {
      console.error('Erro ao carregar fluxos:', error);
      toast({
        title: 'Erro ao carregar fluxos',
        description: 'Não foi possível carregar seus fluxos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!flowToDelete) return;

    setIsDeleting(true);
    try {
      if (flowToDelete.resource_id) {
        // Se tem resource_id, deletar o resource (CASCADE vai deletar o flow)
        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', flowToDelete.resource_id);

        if (error) throw error;
      } else {
        // Se não tem resource_id, deletar o flow diretamente
        const { error } = await supabase
          .from('flows')
          .delete()
          .eq('id', flowToDelete.id);

        if (error) throw error;
      }

      toast({
        title: 'Fluxo excluído',
        description: 'O fluxo foi removido com sucesso.',
      });

      // Recarregar lista
      loadFlows();
    } catch (error) {
      console.error('Erro ao excluir fluxo:', error);
      toast({
        title: 'Erro ao excluir fluxo',
        description: 'Não foi possível excluir o fluxo. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFlowToDelete(null);
    }
  };

  const handleTogglePublish = async (flow: Flow) => {
    try {
      await flowService.togglePublish(flow.id, !flow.is_published);
      toast({
        title: flow.is_published ? 'Fluxo despublicado' : 'Fluxo publicado',
        description: flow.is_published
          ? 'O fluxo não está mais visível para visitantes.'
          : 'O fluxo agora está visível para visitantes.',
      });
      loadFlows();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do fluxo.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenEditDialog = (flow: Flow) => {
    setFlowToEdit(flow);
    setNewFlowName(flow.flow_name);
    setNewFlowDescription(flow.description || '');
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setFlowToEdit(null);
    setNewFlowName('');
    setNewFlowDescription('');
  };

  const handleSaveFlowName = async () => {
    if (!flowToEdit || !newFlowName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('flows')
        .update({ 
          flow_name: newFlowName.trim(),
          description: newFlowDescription.trim() || null
        })
        .eq('id', flowToEdit.id);

      if (error) throw error;

      toast({
        title: 'Fluxo atualizado!',
        description: 'As informações do fluxo foram alteradas com sucesso.',
      });

      loadFlows();
      handleCloseEditDialog();
    } catch (error) {
      console.error('Erro ao atualizar fluxo:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível alterar as informações do fluxo.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateFlowDirect = async (flowId: string, pageId: string) => {
    try {
      // Buscar o flow para verificar se está publicado
      const flow = flows.find(f => f.id === flowId);
      
      await flowService.activateFlowOnPage(flowId, pageId);
      
      if (!flow?.is_published) {
        toast({
          title: '⚠️ Fluxo ativado (não publicado)',
          description: 'O fluxo foi ativado, mas não aparecerá na página pública até ser publicado.',
        });
      } else {
        toast({
          title: 'Fluxo ativado!',
          description: 'O fluxo foi ativado na página selecionada.',
        });
      }

      await loadFlows();
    } catch (error) {
      console.error('Erro ao ativar fluxo:', error);
      toast({
        title: 'Erro ao ativar',
        description: 'Não foi possível ativar o fluxo na página.',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivateFlow = async (flow: Flow) => {
    if (!flow.resource_id) {
      // Se não tem resource_id, não há nada para desativar
      return;
    }
    
    try {
      // Deletar o resource (não apenas setar null no flow)
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', flow.resource_id);
      
      if (error) throw error;
      
      toast({
        title: 'Fluxo desvinculado',
        description: 'O fluxo foi removido da página.',
      });

      await loadFlows();
    } catch (error) {
      console.error('Erro ao desvincular fluxo:', error);
      toast({
        title: 'Erro ao desvincular',
        description: 'Não foi possível desvincular o fluxo.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f9fafb' }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Workflow className="w-8 h-8" />
                Meus Fluxos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie seus fluxos interativos de mensagens
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Buscar fluxos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-400 mr-2" size={24} />
              <span className="text-gray-600">Carregando fluxos...</span>
            </div>
          ) : filteredFlows.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Workflow size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Nenhum fluxo encontrado' : 'Nenhum fluxo criado'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? 'Tente ajustar sua busca'
                    : 'Use o botão "Criar Novo Fluxo" no topo para começar'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlows.map((flow) => (
                <Card
                  key={flow.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg group-hover:text-[#00c6a9] transition-colors">
                            {flow.flow_name}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#00c6a9]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditDialog(flow);
                            }}
                          >
                            <Pencil className="w-3 h-3 text-muted-foreground hover:text-[#00c6a9] transition-colors" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={flow.is_published ? 'default' : 'secondary'}>
                            {flow.is_published ? (
                              <>
                                <Eye size={12} className="mr-1" />
                                Publicado
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} className="mr-1" />
                                Rascunho
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 cursor-pointer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/flow/${flow.id}`);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit size={14} className="mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePublish(flow);
                            }}
                            className="cursor-pointer"
                          >
                            {flow.is_published ? (
                              <>
                                <EyeOff size={14} className="mr-2" />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-2" />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setFlowToDelete(flow);
                              setDeleteDialogOpen(true);
                            }}
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <CardDescription className="line-clamp-2">
                      {flow.description || 'Sem descrição'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar size={14} className="mr-1" />
                      Criado em {formatDate(flow.created_at)}
                    </div>

                    {/* Dropdown para ativar em página */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <Label className="text-xs text-gray-600">Ativar em Página</Label>
                        {!flow.is_published && (
                          <span className="text-xs text-amber-600 font-medium">
                            ⚠️ Não publicado
                          </span>
                        )}
                      </div>
                      <Select 
                        value={(flow as any).page_id || 'none'}
                        onValueChange={(pageId) => {
                          if (pageId === 'none') {
                            handleDeactivateFlow(flow);
                          } else {
                            handleActivateFlowDirect(flow.id, pageId);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Nenhuma página" />
                        </SelectTrigger>
                        <SelectContent>
                          {!flow.is_published && (
                            <div className="px-2 py-1.5 text-xs text-amber-600 bg-amber-50 border-b">
                              ⚠️ Publique o fluxo para aparecer na página
                            </div>
                          )}
                          <SelectItem value="none" className="text-gray-600">
                            📄 Nenhuma página
                          </SelectItem>
                          {pages.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500 text-center">
                              Nenhuma página disponível
                            </div>
                          ) : (
                            pages.map((page) => (
                              <SelectItem key={page.id} value={page.id}>
                                {page.title} ({page.slug})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90"
                        onClick={() => navigate(`/flow/${flow.id}`)}
                      >
                        <Edit size={14} className="mr-2" />
                        Editar Fluxo
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-[#00c6a9]/10 hover:text-[#00c6a9] hover:border-[#00c6a9]"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/flow/${flow.id}/leads`);
                        }}
                        title="Ver Leads"
                      >
                        <Users size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fluxo</DialogTitle>
            <DialogDescription>
              Altere o nome e a descrição do seu fluxo conversacional.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flowName">Nome do Fluxo</Label>
              <Input
                id="flowName"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                placeholder="Digite o nome do fluxo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowDescription">Descrição (opcional)</Label>
              <Input
                id="flowDescription"
                value={newFlowDescription}
                onChange={(e) => setNewFlowDescription(e.target.value)}
                placeholder="Digite a descrição do fluxo"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveFlowName();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog} disabled={isSaving}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90"
              onClick={handleSaveFlowName}
              disabled={!newFlowName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O fluxo "{flowToDelete?.flow_name}" 
              será permanentemente excluído, incluindo todos os nodes e respostas coletadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
