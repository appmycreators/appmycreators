import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Topbar from "@/components/ui/topbar";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { TemplateService, Template } from "@/services/templateService";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

const Home = () => {
  const isMobile = useIsMobile();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const TEMPLATES_PER_PAGE = 6;

  // Carregar templates
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      try {
        const { data, error } = await TemplateService.getPublicTemplates();
        
        if (error) {
          console.error('Error loading templates:', error);
          return;
        }

        setTemplates(data || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Filtrar templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
                            (selectedCategory === 'featured' && template.is_featured) ||
                            template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Cálculos de paginação
  const totalPages = Math.ceil(filteredTemplates.length / TEMPLATES_PER_PAGE);
  const startIndex = (currentPage - 1) * TEMPLATES_PER_PAGE;
  const endIndex = startIndex + TEMPLATES_PER_PAGE;
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  // Resetar para página 1 quando mudar filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Templates em destaque
  const featuredTemplates = templates.filter(t => t.is_featured);

  // Handler para exclusão de template
  const handleDeleteTemplate = (templateId: string) => {
    // Remover o template da lista local
    setTemplates((prevTemplates) => 
      prevTemplates.filter((t) => t.id !== templateId)
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
        {isMobile && <Topbar />}
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                Galeria de Templates
              </h1>
              <p className="text-slate-600 text-lg">
                Escolha um template e crie sua página em segundos
              </p>
            </motion.div>

            

            {/* Tabs de Categorias */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
              <TabsList className="flex-wrap h-auto gap-2">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="featured">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Destaques
                </TabsTrigger>
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="business">Negócios</TabsTrigger>
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="creative">Criativo</TabsTrigger>
                <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
                <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="music">Música</TabsTrigger>
                <TabsTrigger value="digital_product">Produto Digital</TabsTrigger>
                <TabsTrigger value="developer">Developer</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Templates Grid */}
            {!loading && filteredTemplates.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TemplateCard
                      template={template}
                      onUseTemplate={(pageId) => {
                        console.log('Página criada:', pageId);
                      }}
                      onDelete={handleDeleteTemplate}
                      useLightweightPreview={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Paginação */}
            {!loading && filteredTemplates.length > TEMPLATES_PER_PAGE && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center gap-2 mt-8"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <div className="flex items-center gap-2 px-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-10 h-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && filteredTemplates.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-slate-600">
                  {searchQuery
                    ? 'Tente buscar com outros termos'
                    : 'Nenhum template disponível nesta categoria'}
                </p>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
