import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TemplateService } from '@/services/templateService';
import { Upload, Loader2 } from 'lucide-react';

interface ExportTemplateButtonProps {
  pageId: string;
  onSuccess?: (templateId: string) => void;
}

const CATEGORIES = [
  { value: 'general', label: 'Geral' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Negócios' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'creative', label: 'Criativo' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfólio' },
  { value: 'games', label: 'Games' },
  { value: 'music', label: 'Música' },
  { value: 'digital_product', label: 'Produto Digital' },
  { value: 'developer', label: 'Developer' },
] as const;

export const ExportTemplateButton: React.FC<ExportTemplateButtonProps> = ({
  pageId,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('general');

  // Validations
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome do template é obrigatório';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
    } else if (name.trim().length > 100) {
      newErrors.name = 'Nome deve ter no máximo 100 caracteres';
    }

    if (description && description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data: templateId, error } = await TemplateService.exportPageAsTemplate(
        pageId,
        {
          name: name.trim(),
          description: description.trim() || undefined,
          category: category as any,
        }
      );

      if (error) {
        throw error;
      }

      if (!templateId) {
        throw new Error('Falha ao criar template');
      }

      toast({
        title: 'Template criado com sucesso! 🎉',
        description: 'Sua página foi exportada como template e está disponível na galeria.',
      });

      // Reset form
      setName('');
      setDescription('');
      setCategory('general');
      setErrors({});
      setOpen(false);

      // Callback
      onSuccess?.(templateId);
    } catch (error: any) {
      console.error('Error exporting template:', error);
      toast({
        title: 'Erro ao criar template',
        description: error.message || 'Ocorreu um erro ao exportar sua página como template',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Exportar como Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Página como Template</DialogTitle>
          <DialogDescription>
            Transforme sua página em um template reutilizável. Outros usuários poderão usar seu
            design como base para suas páginas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome do Template */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Nome do Template <span className="text-red-500">*</span>
            </Label>
            <Input
              id="template-name"
              placeholder="Ex: Página de Negócios Moderna"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {name.length}/100 caracteres
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Descrição</Label>
            <Textarea
              id="template-description"
              placeholder="Descreva as características do seu template..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={loading}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="template-category">Categoria</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={loading}
            >
              <SelectTrigger id="template-category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Exportar Template
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
