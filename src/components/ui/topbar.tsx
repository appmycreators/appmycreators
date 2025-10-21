import { useState } from "react";
import { Share, Menu, Home, Palette, BarChart3, Plus, Settings, FileText, ArrowLeft, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import ShareModal from "@/components/ShareModal";
import AddPageModal from "@/components/modals/AddPageModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePageOptional } from "@/hooks/usePage";
import { useNavigate, useLocation } from "react-router-dom";

const Topbar = () => {
  const [shareOpen, setShareOpen] = useState(false);
  const [addPageOpen, setAddPageOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se está na rota "/editor" (MainContent/Editor)
  const isEditorPage = location.pathname === "/editor";
  const isMyPagesPage = location.pathname === "/pages";
  const isFlowsPage = location.pathname === "/flows";
  
  // Usar hook opcional - retorna null se não estiver no PageProvider
  const pageContext = usePageOptional();
  const slug = pageContext?.pageData.page?.slug || '';
  
  const menuItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Palette, label: "Customizar", path: "/pages" },
    { icon: Workflow, label: "Fluxos", path: "/flows" },
    { icon: FileText, label: "Leads", path: "/leads" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Plus, label: "Adicionar página", badge: "Pro" },
    { icon: Settings, label: "Ajustes" },
  ];
  
  // Handler quando uma página é criada com sucesso
  const handlePageCreated = () => {
    // Recarrega a página atual para mostrar a nova página na lista
    window.location.reload();
  };
  
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 bg-white border-b border-border h-14 sm:h-[81px]">
      {/* Back Button - Apenas no Editor */}
      {isEditorPage && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-[#00c6a9] hover:bg-[#00c6a9]/10 transition-colors"
          onClick={() => navigate("/pages")}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Minhas Páginas</span>
        </Button>
      )}

      {/* Mobile menu trigger */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 sm:w-80">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                  <span className="text-lg font-bold">MyCreators</span>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-2">
                <div className="space-y-1">
                  {menuItems.map((item, idx) => {
                    // "Customizar" fica ativo tanto em "/editor" quanto em "/pages"
                    const isActive = item.path 
                      ? (item.path === "/pages" 
                          ? (location.pathname === "/editor" || location.pathname === "/pages")
                          : location.pathname === item.path)
                      : false;
                    
                    // Itens sem path não devem navegar
                    const shouldNavigate = Boolean(item.path);
                    
                    return (
                      <Button
                        key={idx}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-11"
                        onClick={() => shouldNavigate && navigate(item.path!)}
                        disabled={!shouldNavigate && !item.badge}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-primary text-primary-foreground px-2 py-0.5 text-xs rounded-full">{item.badge}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <div className="p-4">
                <Button className="w-full" variant="default">
                  Seja PRO ⚡
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {isMyPagesPage && (
          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90 text-white"
            onClick={() => setAddPageOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar Página</span>
          </Button>
        )}
        {isFlowsPage && (
          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-[#00c6a9] to-[#03816e] hover:opacity-90 text-white"
            onClick={() => navigate('/flows/new')}
          >
            <Workflow className="w-4 h-4" />
            <span className="hidden sm:inline">Criar Novo Fluxo</span>
          </Button>
        )}
        {isEditorPage && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-[#00c6a9] hover:text-white hover:border-[#00c6a9] transition-colors"
            onClick={() => setShareOpen(true)}
          >
            <Share className="w-4 h-4" />
            Compartilhar
          </Button>
        )}
      </div>
      
      {/* Modals */}
      {isEditorPage && (
        <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} slug={slug} />
      )}
      <AddPageModal 
        open={addPageOpen} 
        onClose={() => setAddPageOpen(false)} 
        onSuccess={handlePageCreated}
      />
    </div>
  );
};

export default Topbar;
