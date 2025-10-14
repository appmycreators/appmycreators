import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageService, Page } from "@/services/supabaseService";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink, Pencil, Palette, Trash2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/ui/topbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MyPages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [deletingPage, setDeletingPage] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadPages();
    }
  }, [user]);
  const loadPages = async () => {
    if (!user) return;
    
    setLoading(true);
    const userPages = await PageService.getUserPages(user.id);
    setPages(userPages);
    setLoading(false);
  };

  const handleEditPage = (page: Page) => {
    // Navega para a página de edição passando o ID da página como query param
    navigate(`/editor?pageId=${page.id}`);
  };

  const handleViewPage = (slug: string) => {
    window.open(`https://mycreators.me/${slug}`, '_blank');
  };

  const handleOpenEditModal = (page: Page) => {
    setEditingPage(page);
    setNewTitle(page.title);
  };

  const handleCloseEditModal = () => {
    setEditingPage(null);
    setNewTitle("");
  };

  const handleSaveTitle = async () => {
    if (!editingPage || !newTitle.trim()) return;

    try {
      // Atualizar título da página no banco
      const { error } = await supabase
        .from('pages')
        .update({ title: newTitle.trim() })
        .eq('id', editingPage.id);

      if (error) throw error;

      // Atualizar estado local
      setPages(pages.map(p => 
        p.id === editingPage.id 
          ? { ...p, title: newTitle.trim() }
          : p
      ));

      toast({
        title: "Título atualizado!",
        description: "O nome da página foi alterado com sucesso.",
      });

      handleCloseEditModal();
    } catch (error) {
      console.error('Error updating page title:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível alterar o nome da página.",
        variant: "destructive",
      });
    }
  };

  const handleOpenDeleteModal = (page: Page) => {
    setDeletingPage(page);
  };

  const handleCloseDeleteModal = () => {
    setDeletingPage(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPage) return;

    setDeleting(true);

    try {
      const success = await PageService.deletePage(deletingPage.id);

      if (success) {
        // Remover página da lista local
        setPages(pages.filter(p => p.id !== deletingPage.id));

        toast({
          title: "Página excluída!",
          description: `A página "${deletingPage.title}" foi removida com sucesso.`,
        });

        handleCloseDeleteModal();
      } else {
        throw new Error("Falha ao excluir página");
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a página. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Palette className="w-8 h-8" />
                  Minhas Páginas
                </h1>
                <p className="text-muted-foreground mt-1">
                  Selecione uma página para customizar
                </p>
              </div>
            </div>

          {pages.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma página criada</h2>
              <p className="text-muted-foreground">
                Clique no botão "Adicionar Página" acima para criar sua primeira página
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((page) => (
                <Card 
                  key={page.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-foreground group-hover:text-[#00c6a9] transition-colors">
                            {page.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#00c6a9]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(page);
                            }}
                          >
                            <Pencil className="w-3 h-3 text-muted-foreground hover:text-[#00c6a9] transition-colors" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">@{page.slug}</p>
                      </div>
                     
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="flex-1 bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90"
                        onClick={() => handleEditPage(page)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-[#00c6a9] hover:text-white hover:border-[#00c6a9] transition-colors"
                        onClick={() => handleViewPage(page.slug)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                        onClick={() => handleOpenDeleteModal(page)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className={page.is_active ? "text-green-600" : "text-red-600"}>
                          {page.is_active ? "● Ativa" : "● Inativa"}
                        </span>
                        <span>
                          Criada em {new Date(page.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal de Edição de Título */}
      <Dialog open={!!editingPage} onOpenChange={handleCloseEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Nome da Página</DialogTitle>
            <DialogDescription>
              Altere o título da sua página. Isso não afetará o slug/URL.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pageTitle">Nome da Página</Label>
              <Input
                id="pageTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Digite o nome da página"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveTitle();
                  }
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>URL: <span className="font-mono">@{editingPage?.slug}</span></p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditModal}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90"
              onClick={handleSaveTitle}
              disabled={!newTitle.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={!!deletingPage} onOpenChange={handleCloseDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Página</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a página "{deletingPage?.title}"?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Todos os recursos, links e configurações desta página serão permanentemente removidos.
            </p>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ URL: <span className="font-mono">@{deletingPage?.slug}</span> ficará indisponível
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDeleteModal}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir Página"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyPages;
