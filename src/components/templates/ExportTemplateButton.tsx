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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TemplateService } from '@/services/templateService';
import { Upload, X, Loader2 } from 'lucide-react';

interface ExportTemplateButtonProps {
  pageId: string;
  onSuccess?: (templateId: string) => void;
}

const CATEGORIES = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'business', label: 'Negócios' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'creative', label: 'Criativo' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'portfolio', label: 'Portfólio' },
  { value: 'general', label: 'Geral' },
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
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    
    if (!trimmedTag) return;
    
    if (tags.includes(trimmedTag)) {
      toast({
        title: 'Tag duplicada',
        description: 'Esta tag já foi adicionada',
        variant: 'destructive',
      });
      return;
    }

    if (tags.length >= 10) {
      toast({
        title: 'Limite de tags',
        description: 'Você pode adicionar no máximo 10 tags',
        variant: 'destructive',
      });
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
          tags: tags.length > 0 ? tags : undefined,
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
      setTags([]);
      setTagInput('');
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
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

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="template-tags">Tags (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="template-tags"
                placeholder="Digite uma tag e pressione Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading || tags.length >= 10}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                disabled={loading || !tagInput.trim() || tags.length >= 10}
              >
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={loading}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {tags.length}/10 tags
            </p>
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
