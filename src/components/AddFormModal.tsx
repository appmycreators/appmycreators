import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, FileText } from 'lucide-react';
import { useFormSync } from '@/hooks/useFormSync';
import { useToast } from '@/hooks/use-toast';

interface AddFormModalProps {
  open: boolean;
  onClose: () => void;
  editingForm?: {
    id: string;
    title: string;
    form_data: {
      form_name: string;
      description?: string;
      fields_config?: {
        name: boolean;
        email: boolean;
        phone: boolean;
      };
      submit_button_text?: string;
      submit_button_color?: string;
      success_message?: string;
      success_button_text?: string;
      success_button_color?: string;
      success_bg_color?: string;
    };
  } | null;
}

export const AddFormModal = ({ open, onClose, editingForm }: AddFormModalProps) => {
  const { addForm, updateForm, updateResourceTitle, loading } = useFormSync();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    form_name: '',
    description: '',
    fields_config: {
      name: true,
      email: true,
      phone: true,
    },
    submit_button_text: 'Enviar',
    submit_button_color: '#000000',
    success_message: 'Obrigado! Seus dados foram enviados com sucesso.',
    success_button_text: 'Enviar outro',
    success_button_color: '#000000',
    success_bg_color: '#f0f9ff',
  });

  // Populate form data when editing
  useEffect(() => {
    if (editingForm) {
      setFormData({
        title: editingForm.title,
        form_name: editingForm.form_data.form_name,
        description: editingForm.form_data.description || '',
        fields_config: editingForm.form_data.fields_config || {
          name: true,
          email: true,
          phone: true,
        },
        submit_button_text: editingForm.form_data.submit_button_text || 'Enviar',
        submit_button_color: editingForm.form_data.submit_button_color || '#000000',
        success_message: editingForm.form_data.success_message || 'Obrigado! Seus dados foram enviados com sucesso.',
        success_button_text: editingForm.form_data.success_button_text || 'Enviar outro',
        success_button_color: editingForm.form_data.success_button_color || '#000000',
        success_bg_color: editingForm.form_data.success_bg_color || '#f0f9ff',
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        form_name: '',
        description: '',
        fields_config: {
          name: true,
          email: true,
          phone: true,
        },
        submit_button_text: 'Enviar',
        submit_button_color: '#000000',
        success_message: 'Obrigado! Seus dados foram enviados com sucesso.',
        success_button_text: 'Enviar outro',
        success_button_color: '#000000',
        success_bg_color: '#f0f9ff',
      });
    }
  }, [editingForm, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.form_name.trim()) {
      alert('Por favor, preencha o título e o nome do formulário');
      return;
    }

    let success;
    
    if (editingForm) {
      // Update existing form
      success = await updateForm(editingForm.id, {
        form_name: formData.form_name,
        description: formData.description || undefined,
        fields_config: formData.fields_config,
        submit_button_text: formData.submit_button_text,
        submit_button_color: formData.submit_button_color,
        success_message: formData.success_message,
        success_button_text: formData.success_button_text,
        success_button_color: formData.success_button_color,
        success_bg_color: formData.success_bg_color,
      });
      
      // Also update resource title if needed
      if (formData.title !== editingForm.title) {
        await updateResourceTitle(editingForm.id, formData.title);
      }
    } else {
      // Create new form
      success = await addForm(formData.title, {
        form_name: formData.form_name,
        description: formData.description || undefined,
        fields_config: formData.fields_config,
        submit_button_text: formData.submit_button_text,
        submit_button_color: formData.submit_button_color,
        success_message: formData.success_message,
        success_button_text: formData.success_button_text,
        success_button_color: formData.success_button_color,
        success_bg_color: formData.success_bg_color,
      });
    }

    if (success) {
      toast({
        title: editingForm ? "Formulário atualizado!" : "Formulário criado!",
        description: editingForm ? "As alterações foram salvas com sucesso." : "Seu formulário de captura foi criado com sucesso.",
      });
      onClose();
    } else {
      toast({
        title: "Erro",
        description: editingForm ? 'Erro ao atualizar formulário. Tente novamente.' : 'Erro ao criar formulário. Tente novamente.',
        variant: "destructive",
      });
    }
  };

  const handleFieldToggle = (field: 'name' | 'email' | 'phone') => {
    setFormData((prev) => ({
      ...prev,
      fields_config: {
        ...prev.fields_config,
        [field]: !prev.fields_config[field],
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {editingForm ? 'Editar Formulário de Captura' : 'Adicionar Formulário de Captura'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Card</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Cadastre-se para receber novidades"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este é o título que aparecerá no card na sua página
              </p>
            </div>

            <div>
              <Label htmlFor="form_name">Nome do Formulário (Interno)</Label>
              <Input
                id="form_name"
                value={formData.form_name}
                onChange={(e) => setFormData({ ...formData, form_name: e.target.value })}
                placeholder="Ex: Newsletter Principal"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nome para identificar este formulário no gerenciamento de leads
              </p>
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição sobre o formulário"
                rows={2}
              />
            </div>
          </div>

          {/* Fields Config */}
          <div className="space-y-3">
            <Label>Campos do Formulário</Label>
            <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-name"
                  checked={formData.fields_config.name}
                  onCheckedChange={() => handleFieldToggle('name')}
                />
                <label
                  htmlFor="field-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Nome
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-email"
                  checked={formData.fields_config.email}
                  onCheckedChange={() => handleFieldToggle('email')}
                />
                <label
                  htmlFor="field-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Email
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="field-phone"
                  checked={formData.fields_config.phone}
                  onCheckedChange={() => handleFieldToggle('phone')}
                />
                <label
                  htmlFor="field-phone"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Telefone
                </label>
              </div>
            </div>
          </div>

          {/* Button Customization */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="submit_text">Texto do Botão</Label>
              <Input
                id="submit_text"
                value={formData.submit_button_text}
                onChange={(e) =>
                  setFormData({ ...formData, submit_button_text: e.target.value })
                }
                placeholder="Enviar"
              />
            </div>

            <div>
              <Label htmlFor="button_color">Cor do Botão</Label>
              <div className="flex gap-2">
                <Input
                  id="button_color"
                  type="color"
                  value={formData.submit_button_color}
                  onChange={(e) =>
                    setFormData({ ...formData, submit_button_color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.submit_button_color}
                  onChange={(e) =>
                    setFormData({ ...formData, submit_button_color: e.target.value })
                  }
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="success_message">Mensagem de Sucesso</Label>
              <Textarea
                id="success_message"
                value={formData.success_message}
                onChange={(e) =>
                  setFormData({ ...formData, success_message: e.target.value })
                }
                placeholder="Obrigado! Seus dados foram enviados com sucesso."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="success_button_text">Texto do Botão "Enviar Outro"</Label>
              <Input
                id="success_button_text"
                value={formData.success_button_text}
                onChange={(e) =>
                  setFormData({ ...formData, success_button_text: e.target.value })
                }
                placeholder="Enviar outro"
              />
            </div>

            <div>
              <Label htmlFor="success_button_color">Cor do Botão "Enviar Outro"</Label>
              <div className="flex gap-2">
                <Input
                  id="success_button_color"
                  type="color"
                  value={formData.success_button_color}
                  onChange={(e) =>
                    setFormData({ ...formData, success_button_color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.success_button_color}
                  onChange={(e) =>
                    setFormData({ ...formData, success_button_color: e.target.value })
                  }
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="success_bg_color">Cor de Fundo do Estado de Sucesso</Label>
              <div className="flex gap-2">
                <Input
                  id="success_bg_color"
                  type="color"
                  value={formData.success_bg_color}
                  onChange={(e) =>
                    setFormData({ ...formData, success_bg_color: e.target.value })
                  }
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={formData.success_bg_color}
                  onChange={(e) =>
                    setFormData({ ...formData, success_bg_color: e.target.value })
                  }
                  placeholder="#f0f9ff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {editingForm ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                editingForm ? 'Atualizar Formulário' : 'Criar Formulário'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
