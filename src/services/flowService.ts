// ============================================
// FLOW SERVICE - API calls para Flows
// ============================================

import { supabase } from '@/lib/supabase';
import type {
  Flow,
  FlowNode,
  FlowEdge,
  FlowResponse,
  FlowStats,
  FlowComplete,
  CreateFlowDto,
  UpdateFlowDto,
  CreateNodeDto,
  UpdateNodeDto,
  CreateEdgeDto,
  SaveFlowStateDto,
  SubmitResponseDto,
} from '@/types/flow.types';

// ============================================
// FLOW CRUD
// ============================================

export const flowService = {
  /**
   * Criar novo flow
   */
  async createFlow(data: CreateFlowDto): Promise<Flow> {
    // Buscar user_id do usuário autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data: flow, error } = await supabase
      .from('flows')
      .insert({
        ...data,
        user_id: user.id, // Adicionar user_id
        resource_id: null, // Sempre criar sem resource_id
      })
      .select()
      .single();

    if (error) throw error;
    return flow;
  },

  /**
   * Buscar flow por ID
   */
  async getFlow(flowId: string): Promise<Flow | null> {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Buscar flow por resource_id
   */
  async getFlowByResourceId(resourceId: string): Promise<Flow | null> {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Buscar todos os flows do usuário atual
   */
  async getUserFlows(): Promise<Flow[]> {
    // Buscar usuário autenticado
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    // Buscar flows pelo user_id (agora funciona com ou sem resource_id)
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Atualizar flow
   */
  async updateFlow(flowId: string, data: UpdateFlowDto): Promise<Flow> {
    const { data: flow, error } = await supabase
      .from('flows')
      .update(data)
      .eq('id', flowId)
      .select()
      .single();

    if (error) throw error;
    return flow;
  },

  /**
   * Deletar flow
   */
  async deleteFlow(flowId: string): Promise<void> {
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', flowId);

    if (error) throw error;
  },

  /**
   * Publicar/despublicar flow
   */
  async togglePublish(flowId: string, isPublished: boolean): Promise<Flow> {
    return this.updateFlow(flowId, { is_published: isPublished });
  },

  // ============================================
  // NODES CRUD
  // ============================================

  /**
   * Buscar todos os nodes de um flow
   */
  async getFlowNodes(flowId: string): Promise<FlowNode[]> {
    const { data, error } = await supabase
      .from('flow_nodes')
      .select('*')
      .eq('flow_id', flowId)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Criar node
   */
  async createNode(flowId: string, data: CreateNodeDto): Promise<FlowNode> {
    const { data: node, error } = await supabase
      .from('flow_nodes')
      .insert({ flow_id: flowId, ...data })
      .select()
      .single();

    if (error) throw error;
    return node;
  },

  /**
   * Atualizar node
   */
  async updateNode(nodeId: string, data: UpdateNodeDto): Promise<FlowNode> {
    const { data: node, error } = await supabase
      .from('flow_nodes')
      .update(data)
      .eq('id', nodeId)
      .select()
      .single();

    if (error) throw error;
    return node;
  },

  /**
   * Deletar node
   */
  async deleteNode(nodeId: string): Promise<void> {
    const { error } = await supabase
      .from('flow_nodes')
      .delete()
      .eq('id', nodeId);

    if (error) throw error;
  },

  /**
   * Deletar todos os nodes de um flow
   */
  async deleteAllNodes(flowId: string): Promise<void> {
    const { error } = await supabase
      .from('flow_nodes')
      .delete()
      .eq('flow_id', flowId);

    if (error) throw error;
  },

  // ============================================
  // EDGES CRUD
  // ============================================

  /**
   * Buscar todas as edges de um flow
   */
  async getFlowEdges(flowId: string): Promise<FlowEdge[]> {
    const { data, error } = await supabase
      .from('flow_edges')
      .select('*')
      .eq('flow_id', flowId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Criar edge
   */
  async createEdge(flowId: string, data: CreateEdgeDto): Promise<FlowEdge> {
    const { data: edge, error } = await supabase
      .from('flow_edges')
      .insert({ flow_id: flowId, ...data })
      .select()
      .single();

    if (error) throw error;
    return edge;
  },

  /**
   * Atualizar edge
   */
  async updateEdge(edgeId: string, data: Partial<CreateEdgeDto>): Promise<FlowEdge> {
    const { data: edge, error } = await supabase
      .from('flow_edges')
      .update(data)
      .eq('id', edgeId)
      .select()
      .single();

    if (error) throw error;
    return edge;
  },

  /**
   * Deletar edge
   */
  async deleteEdge(edgeId: string): Promise<void> {
    const { error } = await supabase
      .from('flow_edges')
      .delete()
      .eq('id', edgeId);

    if (error) throw error;
  },

  /**
   * Deletar todas as edges de um flow
   */
  async deleteAllEdges(flowId: string): Promise<void> {
    const { error } = await supabase
      .from('flow_edges')
      .delete()
      .eq('flow_id', flowId);

    if (error) throw error;
  },

  // ============================================
  // FLOW COMPLETO
  // ============================================

  /**
   * Buscar flow completo (flow + nodes + edges)
   * Usa a função SQL get_flow_complete
   */
  async getFlowComplete(flowId: string): Promise<FlowComplete> {
    const { data, error } = await supabase
      .rpc('get_flow_complete', { p_flow_id: flowId });

    if (error) throw error;
    return data as FlowComplete;
  },

  /**
   * Salvar estado completo do flow (nodes + edges)
   * Deleta todos os nodes/edges existentes e recria
   */
  async saveFlowState(flowId: string, stateData: SaveFlowStateDto): Promise<void> {
    // Deletar nodes e edges existentes
    await Promise.all([
      this.deleteAllNodes(flowId),
      this.deleteAllEdges(flowId),
    ]);

    // Criar novos nodes
    if (stateData.nodes.length > 0) {
      const { error: nodesError } = await supabase
        .from('flow_nodes')
        .insert(
          stateData.nodes.map((node) => ({
            flow_id: flowId,
            ...node,
          }))
        );

      if (nodesError) throw nodesError;
    }

    // Criar novas edges
    if (stateData.edges.length > 0) {
      const { error: edgesError } = await supabase
        .from('flow_edges')
        .insert(
          stateData.edges.map((edge) => ({
            flow_id: flowId,
            ...edge,
          }))
        );

      if (edgesError) throw edgesError;
    }
  },

  // ============================================
  // RESPONSES
  // ============================================

  /**
   * Criar nova response (quando usuário inicia o flow)
   */
  async createResponse(flowId: string, sessionId: string, data?: Partial<FlowResponse>): Promise<FlowResponse> {
    const { data: response, error } = await supabase
      .from('flow_responses')
      .insert({
        flow_id: flowId,
        session_id: sessionId,
        responses: {},
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return response;
  },

  /**
   * Atualizar response (adicionar nova resposta de um node)
   */
  async updateResponse(
    responseId: string,
    nodeId: string,
    value: any,
    currentNodeId?: string
  ): Promise<FlowResponse> {
    // Buscar response atual
    const { data: current, error: fetchError } = await supabase
      .from('flow_responses')
      .select('responses')
      .eq('id', responseId)
      .single();

    if (fetchError) throw fetchError;

    // Adicionar nova resposta
    const updatedResponses = {
      ...current.responses,
      [nodeId]: {
        value,
        timestamp: new Date().toISOString(),
      },
    };

    // Atualizar
    const { data: response, error } = await supabase
      .from('flow_responses')
      .update({
        responses: updatedResponses,
        current_node_id: currentNodeId,
        last_interaction_at: new Date().toISOString(),
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;
    return response;
  },

  /**
   * Marcar response como completa
   */
  async completeResponse(responseId: string, timeSpent: number): Promise<FlowResponse> {
    const { data: response, error } = await supabase
      .from('flow_responses')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
        time_spent: timeSpent,
      })
      .eq('id', responseId)
      .select()
      .single();

    if (error) throw error;
    return response;
  },

  /**
   * Buscar todas as responses de um flow
   */
  async getFlowResponses(flowId: string, limit = 100): Promise<FlowResponse[]> {
    const { data, error } = await supabase
      .from('flow_responses')
      .select('*')
      .eq('flow_id', flowId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar response por session_id
   */
  async getResponseBySession(sessionId: string): Promise<FlowResponse | null> {
    const { data, error } = await supabase
      .from('flow_responses')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // ============================================
  // STATISTICS
  // ============================================

  /**
   * Buscar estatísticas do flow
   * Usa a função SQL get_flow_stats
   */
  async getFlowStats(flowId: string): Promise<FlowStats> {
    const { data, error } = await supabase
      .rpc('get_flow_stats', { p_flow_id: flowId });

    if (error) throw error;
    return data[0] as FlowStats;
  },

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Duplicar flow completo
   * Usa a função SQL duplicate_flow
   */
  async duplicateFlow(
    flowId: string,
    newResourceId: string,
    newName: string
  ): Promise<string> {
    const { data, error } = await supabase
      .rpc('duplicate_flow', {
        p_flow_id: flowId,
        p_new_resource_id: newResourceId,
        p_new_name: newName,
      });

    if (error) throw error;
    return data as string; // Returns new flow ID
  },

  /**
   * Ativar flow em uma página (criar resource)
   */
  async activateFlowOnPage(flowId: string, pageId: string): Promise<{ resourceId: string }> {
    console.log('🔄 Ativando flow:', { flowId, pageId });
    
    // Buscar flow para pegar o nome
    const flow = await this.getFlow(flowId);
    if (!flow) throw new Error('Flow não encontrado');
    
    console.log('✅ Flow encontrado:', flow);

    // Se o flow já tem resource_id, verificar se precisa mover
    if (flow.resource_id) {
      console.log('ℹ️ Flow já possui resource_id:', flow.resource_id);
      
      // Verificar se o resource existe e pertence à página correta
      const { data: existingResource, error: checkResourceError } = await supabase
        .from('resources')
        .select('id, page_id')
        .eq('id', flow.resource_id)
        .maybeSingle();
      
      if (checkResourceError) {
        console.error('❌ Erro ao verificar resource:', checkResourceError);
      }
      
      if (existingResource) {
        if (existingResource.page_id === pageId) {
          console.log('✅ Flow já está ativo nesta página');
          return { resourceId: existingResource.id };
        } else {
          console.log('⚠️ Flow está ativo em outra página (page_id: ' + existingResource.page_id + '), será movido para página: ' + pageId);
          
          // ATUALIZAR o resource existente ao invés de deletar
          const { error: updateResourceError } = await supabase
            .from('resources')
            .update({ page_id: pageId })
            .eq('id', flow.resource_id);
          
          if (updateResourceError) {
            console.error('❌ Erro ao mover resource:', updateResourceError);
            throw updateResourceError;
          }
          
          console.log('✅ Resource movido para nova página');
          return { resourceId: flow.resource_id };
        }
      } else {
        console.log('⚠️ Resource não encontrado, será criado novo');
      }
    }

    // Verificar se já existe um resource de flow para esta página
    // Nota: Pode haver múltiplos flows, pegamos o primeiro
    const { data: existingResources, error: checkError } = await supabase
      .from('resources')
      .select('id')
      .eq('page_id', pageId)
      .eq('type', 'flow')
      .limit(1);

    if (checkError) {
      console.error('❌ Erro ao verificar resource existente:', checkError);
      throw checkError;
    }

    const existingResource = existingResources?.[0];

    // Se já existe um resource de flow nesta página, reutilizar
    if (existingResource) {
      console.log('♻️ Resource de flow existente encontrado, reutilizando:', existingResource.id);
      
      // Atualizar flow com este resource_id
      const { error: updateError } = await supabase
        .from('flows')
        .update({ resource_id: existingResource.id })
        .eq('id', flowId);

      if (updateError) {
        console.error('❌ Erro ao atualizar flow:', updateError);
        throw updateError;
      }
      
      console.log('✅ Flow vinculado ao resource existente');
      return { resourceId: existingResource.id };
    }

    // Buscar maior display_order
    const { data: maxOrder } = await supabase
      .from('resources')
      .select('display_order')
      .eq('page_id', pageId)
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = (maxOrder?.display_order || 0) + 1;
    console.log('📊 Próximo display_order:', nextOrder);

    // Criar novo resource
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .insert({
        page_id: pageId,
        type: 'flow',
        title: flow.flow_name,
        display_order: nextOrder,
        is_visible: true,
      })
      .select()
      .single();

    if (resourceError) {
      console.error('❌ Erro ao criar resource:', resourceError);
      throw resourceError;
    }

    console.log('✅ Resource criado:', resource);

    // Atualizar flow com resource_id
    const { error: updateError } = await supabase
      .from('flows')
      .update({ resource_id: resource.id })
      .eq('id', flowId);

    if (updateError) {
      console.error('❌ Erro ao atualizar flow com resource_id:', updateError);
      throw updateError;
    }

    console.log('✅ Flow ativado com sucesso! Resource ID:', resource.id);
    return { resourceId: resource.id };
  },

  /**
   * Desativar flow de uma página (remover resource)
   */
  async deactivateFlowFromPage(flowId: string): Promise<void> {
    const flow = await this.getFlow(flowId);
    if (!flow || !flow.resource_id) return;

    // Remover resource_id do flow
    const { error: updateError } = await supabase
      .from('flows')
      .update({ resource_id: null })
      .eq('id', flowId);

    if (updateError) throw updateError;

    // Deletar resource (CASCADE vai remover relacionamentos)
    const { error: deleteError } = await supabase
      .from('resources')
      .delete()
      .eq('id', flow.resource_id);

    if (deleteError) throw deleteError;
  },

  /**
   * Buscar páginas do usuário para ativar flow
   */
  async getUserPages(): Promise<Array<{ id: string; title: string; slug: string }>> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('pages')
      .select('id, title, slug')
      .eq('user_id', userData.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
