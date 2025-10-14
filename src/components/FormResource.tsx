import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormLeadService } from '@/services/supabaseService';
import { Check, Loader2, Edit2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface FormResourceProps {
  formId: string;
  formData: {
    form_name: string;
    description: string | null;
    fields_config: {
      name: boolean;
      email: boolean;
      phone: boolean;
    };
    submit_button_text: string;
    submit_button_color: string;
    success_message: string;
    success_button_text?: string;
    success_button_color?: string;
    success_bg_color?: string;
  };
  title: string;
  cardBgColor?: string;
  cardTextColor?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isPublic?: boolean;
}

export const FormResource = ({
  formId,
  formData,
  title,
  cardBgColor = '#ffffff',
  cardTextColor = '#000000',
  onEdit,
  onDelete,
  isPublic = false,
}: FormResourceProps) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Remove non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Accept phones with 10 or 11 digits
    return cleaned.length >= 10 && cleaned.length <= 11;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (formData.fields_config.name && !formState.name.trim()) {
      setError('Por favor, preencha o nome');
      return;
    }

    if (formData.fields_config.email) {
      if (!formState.email.trim()) {
        setError('Por favor, preencha o email');
        return;
      }
      if (!validateEmail(formState.email)) {
        setError('Por favor, insira um email válido');
        return;
      }
    }

    if (formData.fields_config.phone) {
      if (!formState.phone.trim()) {
        setError('Por favor, preencha o telefone');
        return;
      }
      if (!validatePhone(formState.phone)) {
        setError('Por favor, insira um telefone válido');
        return;
      }
    }

    setLoading(true);

    try {
      const result = await FormLeadService.submitLead(formId, {
        name: formData.fields_config.name ? formState.name : undefined,
        email: formData.fields_config.email ? formState.email : undefined,
        phone: formData.fields_config.phone ? formState.phone : undefined,
      });

      if (result) {
        setSubmitted(true);
        setFormState({ name: '', email: '', phone: '' });
      } else {
        setError('Erro ao enviar. Tente novamente.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card
        className="rounded-2xl p-6 shadow-md text-center"
        style={{ 
          backgroundColor: formData.success_bg_color || cardBgColor, 
          color: cardTextColor 
        }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-sm opacity-80 mb-4">{formData.success_message}</p>
          </div>
          <Button
            onClick={() => setSubmitted(false)}
            className="rounded-full font-semibold transition-all duration-300 hover:opacity-90"
            style={{
              backgroundColor: formData.success_button_color || '#000000',
              color: '#ffffff',
            }}
          >
            {formData.success_button_text || 'Enviar outro'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="rounded-2xl p-6 shadow-md"
      style={{ backgroundColor: cardBgColor, color: cardTextColor }}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg font-bold">{title}</h3>
          {!isPublic && (onEdit || onDelete) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onEdit}
                  className="h-8 w-8 hover:bg-black/10 rounded-full"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:bg-black/10 rounded-full"
                      aria-label="Mais ações"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete?.()}>
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
        {formData.description && (
          <p className="text-sm opacity-80">{formData.description}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formData.fields_config.name && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome
            </label>
            <Input
              id="name"
              type="text"
              value={formState.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Seu nome completo"
              className="w-full"
              style={{
                backgroundColor: `${cardBgColor}dd`,
                borderColor: `${cardTextColor}33`,
                color: cardTextColor,
              }}
              disabled={loading}
            />
          </div>
        )}

        {formData.fields_config.email && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu@email.com"
              className="w-full"
              style={{
                backgroundColor: `${cardBgColor}dd`,
                borderColor: `${cardTextColor}33`,
                color: cardTextColor,
              }}
              disabled={loading}
            />
          </div>
        )}

        {formData.fields_config.phone && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2">
              Telefone
            </label>
            <Input
              id="phone"
              type="tel"
              value={formState.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="(00) 00000-0000"
              className="w-full"
              style={{
                backgroundColor: `${cardBgColor}dd`,
                borderColor: `${cardTextColor}33`,
                color: cardTextColor,
              }}
              disabled={loading}
            />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-full font-semibold transition-all duration-300 hover:opacity-90"
          style={{
            backgroundColor: formData.submit_button_color,
            color: '#ffffff',
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            formData.submit_button_text
          )}
        </Button>
      </form>
    </Card>
  );
};
