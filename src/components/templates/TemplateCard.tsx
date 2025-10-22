import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Template, TemplateService } from '@/services/templateService';
import { TemplatePreviewMockup } from './TemplatePreviewMockup';
import { Sparkles, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UseTemplateModal from '@/components/modals/UseTemplateModal';
import { useAuth } from '@/contexts/AuthContext';
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

interface TemplateCardProps {
  template: Template;
  onUseTemplate?: (pageId: string) => void;
  onDelete?: (templateId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'Marketing',
  business: 'Negócios',
  personal: 'Pessoal',
  creative: 'Criativo',
  ecommerce: 'E-commerce',
  portfolio: 'Portfólio',
  general: 'Geral',
};

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUseTemplate, onDelete }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Verificar se o usuário atual é o criador do template
  const isCreator = user?.id === template.creator_user_id;

  const handleUseTemplateSuccess = (pageId: string) => {
    // Callback
    onUseTemplate?.(pageId);

    // Redirecionar para o editor com o ID da página criada
    setTimeout(() => {
      navigate(`/editor?pageId=${pageId}`);
    }, 1000);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const { success, error } = await TemplateService.deleteTemplate(template.id);

      if (error || !success) {
        toast({
          title: 'Erro ao excluir template',
          description: error?.message || 'Ocorreu um erro ao excluir o template.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      });

      // Callback para atualizar a lista
      onDelete?.(template.id);

      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Erro ao excluir template',
        description: 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="w-full max-w-sm overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl line-clamp-1 flex items-center gap-2">
              {template.is_featured && (
                <Sparkles className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              )}
              {template.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {template.description || 'Template sem descrição'}
            </CardDescription>
          </div>
          {isCreator && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDeleteClick}
              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Badge */}
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary">
            {CATEGORY_LABELS[template.category] || template.category}
          </Badge>
          {template.is_featured && (
            <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
              Destaque
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Preview Mockup */}
        <TemplatePreviewMockup
          templateId={template.id}
          previewImageUrl={template.preview_image_url}
          templateName={template.name}
        />

        
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-4 border-t">
        

        {/* Action Button */}
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full"
          size="lg"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Usar este template
        </Button>
      </CardFooter>

      {/* Modal de configuração */}
      <UseTemplateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleUseTemplateSuccess}
        templateId={template.id}
        templateName={template.name}
      />

      {/* Modal de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template <strong>"{template.name}"</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita. O template e todas as suas configurações
              (recursos, galerias, formulários, etc.) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
