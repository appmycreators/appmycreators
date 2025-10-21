import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Workflow, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { flowService } from '@/services/flowService';
import Sidebar from '@/components/Sidebar';

export default function NewFlow() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    flowName: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.flowName.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome para o fluxo.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      // 1. Buscar a página ativa do usuário
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pages, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('user_id', userData.user.id)
        .eq('is_primary', true)
        .single();

      if (pageError || !pages) {
        throw new Error('Página não encontrada');
      }

      // 2. Criar o resource do tipo 'flow'
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert({
          page_id: pages.id,
          type: 'flow',
          title: formData.flowName,
          is_visible: true,
          display_order: 999, // Adicionar no final
        })
        .select()
        .single();

      if (resourceError || !resource) {
        throw new Error('Erro ao criar resource');
      }

      // 3. Criar o flow
      const flow = await flowService.createFlow({
        resource_id: resource.id,
        flow_name: formData.flowName,
        description: formData.description || undefined,
        theme: 'light',
        primary_color: '#3b82f6',
        background_color: '#ffffff',
      });

      toast({
        title: 'Fluxo criado! 🎉',
        description: 'Você será redirecionado para o editor.',
      });

      // 4. Redirecionar para o builder
      setTimeout(() => {
        navigate(`/flow/${flow.id}`);
      }, 1000);

    } catch (error) {
      console.error('Erro ao criar flow:', error);
      toast({
        title: 'Erro ao criar fluxo',
        description: error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/flows')}
              className="mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Workflow size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Criar Novo Fluxo</h1>
                <p className="text-gray-600">Monte fluxos interativos de mensagens para seus visitantes</p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Fluxo</CardTitle>
              <CardDescription>
                Escolha um nome e descrição para identificar seu fluxo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome do Fluxo */}
                <div className="space-y-2">
                  <Label htmlFor="flowName">
                    Nome do Fluxo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="flowName"
                    placeholder="Ex: Boas-vindas, Captação de Leads, Pesquisa de Satisfação"
                    value={formData.flowName}
                    onChange={(e) => setFormData({ ...formData, flowName: e.target.value })}
                    disabled={isCreating}
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500">
                    Este nome é apenas para você identificar o fluxo internamente
                  </p>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (Opcional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o objetivo deste fluxo..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isCreating}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 caracteres
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 O que você pode fazer:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Criar sequências de mensagens personalizadas</li>
                    <li>• Adicionar imagens, vídeos e áudios</li>
                    <li>• Coletar informações dos visitantes</li>
                    <li>• Criar experiências interativas únicas</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isCreating || !formData.flowName.trim()}
                    className="flex-1 sm:flex-none"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <Workflow size={16} className="mr-2" />
                        Criar e Começar a Editar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    disabled={isCreating}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Templates Section (para o futuro) */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Templates Prontos (Em Breve)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Boas-vindas', desc: 'Mensagem inicial para novos visitantes' },
                { name: 'Captação de Leads', desc: 'Colete informações de contato' },
                { name: 'FAQ Interativo', desc: 'Responda perguntas frequentes' },
              ].map((template, index) => (
                <Card key={index} className="opacity-50 cursor-not-allowed">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm">{template.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" disabled className="w-full">
                      Em Breve
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
