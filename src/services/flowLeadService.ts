import { supabase } from '@/lib/supabase';

export interface FlowLead {
  id: string;
  flow_id: string;
  session_id: string;
  name?: string;
  email?: string;
  phone?: string;
  number_value?: number;
  captured_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  started_at: string;
  completed_at?: string;
}

export interface CreateFlowLeadDto {
  flow_id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
}

export interface UpdateFlowLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  number_value?: number;
  captured_data?: Record<string, any>;
  completed_at?: string;
}

/**
 * Serviço para gerenciar leads capturadas em fluxos
 */
export const flowLeadService = {
  /**
   * Criar nova lead ao iniciar conversa
   */
  async createLead(data: CreateFlowLeadDto): Promise<FlowLead> {
    const { data: lead, error } = await supabase
      .from('flow_leads')
      .insert({
        flow_id: data.flow_id,
        session_id: data.session_id,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        captured_data: {}
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar lead:', error);
      throw error;
    }

    return lead;
  },

  /**
   * Atualizar lead com dados capturados
   */
  async updateLead(sessionId: string, data: UpdateFlowLeadDto): Promise<FlowLead> {
    const { data: lead, error } = await supabase
      .from('flow_leads')
      .update(data)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }

    return lead;
  },

  /**
   * Capturar dados de InputNode e atualizar lead
   */
  async captureInputData(
    sessionId: string, 
    variable: string, 
    value: string,
    inputType: string,
    dbField?: 'name' | 'email' | 'phone' | 'none'
  ): Promise<void> {
    // Buscar lead atual
    const { data: currentLead, error: fetchError } = await supabase
      .from('flow_leads')
      .select('captured_data, name, email, phone, number_value')
      .eq('session_id', sessionId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar lead:', fetchError);
      throw fetchError;
    }

    // Atualizar captured_data
    const updatedData = {
      ...currentLead.captured_data,
      [variable]: value
    };

    // Preparar update
    const updatePayload: UpdateFlowLeadDto = {
      captured_data: updatedData
    };

    // Mapear para campo específico do banco se definido
    if (dbField && dbField !== 'none') {
      if (dbField === 'name') {
        updatePayload.name = value;
      } else if (dbField === 'email') {
        updatePayload.email = value;
      } else if (dbField === 'phone') {
        updatePayload.phone = value;
      }
    } else {
      // Fallback: Mapear campos especiais automaticamente (comportamento antigo)
      if (inputType === 'email') {
        updatePayload.email = value;
      } else if (inputType === 'phone') {
        updatePayload.phone = value;
      } else if (inputType === 'number') {
        updatePayload.number_value = parseFloat(value);
      } else if (variable === 'name' || variable === 'nome') {
        updatePayload.name = value;
      }
    }

    await this.updateLead(sessionId, updatePayload);
  },

  /**
   * Marcar conversa como completa
   */
  async completeConversation(sessionId: string): Promise<void> {
    await this.updateLead(sessionId, {
      completed_at: new Date().toISOString()
    });
  },

  /**
   * Buscar leads de um fluxo
   */
  async getFlowLeads(flowId: string): Promise<FlowLead[]> {
    const { data, error } = await supabase
      .from('flow_leads')
      .select('*')
      .eq('flow_id', flowId)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar leads:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Obter IP do usuário (usando serviço externo)
   */
  async getUserIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || null;
    } catch (error) {
      console.error('Erro ao obter IP:', error);
      return null;
    }
  },

  /**
   * Obter User Agent
   */
  getUserAgent(): string {
    return navigator.userAgent;
  },

  /**
   * Deletar uma lead
   */
  async deleteLead(leadId: string): Promise<void> {
    const { error } = await supabase
      .from('flow_leads')
      .delete()
      .eq('id', leadId);

    if (error) {
      console.error('Erro ao deletar lead:', error);
      throw error;
    }
  }
};
