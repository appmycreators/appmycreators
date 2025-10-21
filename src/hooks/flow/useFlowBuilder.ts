import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { flowService } from '@/services/flowService';
import type {
  Flow,
  ReactFlowNode,
  ReactFlowEdge,
  NodeType,
  NodeData,
  FlowBuilderState,
  CreateNodeDto,
  CreateEdgeDto,
} from '@/types/flow.types';

interface UseFlowBuilderOptions {
  flowId?: string;
  resourceId?: string;
  autoSave?: boolean;
  autoSaveInterval?: number; // ms
}

export function useFlowBuilder({
  flowId,
  resourceId,
  autoSave = true,
  autoSaveInterval = 30000, // 30 segundos
}: UseFlowBuilderOptions = {}) {
  const [state, setState] = useState<FlowBuilderState>({
    flow: null,
    nodes: [],
    edges: [],
    selectedNode: null,
    selectedEdge: null,
    isLoading: true,
    isSaving: false,
    lastSaved: undefined,
  });

  const autoSaveTimerRef = useRef<NodeJS.Timeout>();

  // ============================================
  // LOAD FLOW
  // ============================================
  const loadFlow = useCallback(async () => {
    if (!flowId && !resourceId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      let flow: Flow | null = null;

      if (flowId) {
        flow = await flowService.getFlow(flowId);
      } else if (resourceId) {
        flow = await flowService.getFlowByResourceId(resourceId);
      }

      if (!flow) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      // Carregar nodes e edges
      const [nodes, edges] = await Promise.all([
        flowService.getFlowNodes(flow.id),
        flowService.getFlowEdges(flow.id),
      ]);

      // Converter para formato ReactFlow
      const reactFlowNodes: ReactFlowNode[] = nodes.map((node) => ({
        id: node.node_id,
        type: node.node_type,
        position: { x: node.position_x, y: node.position_y },
        data: node.data,
      }));

      const reactFlowEdges: ReactFlowEdge[] = edges.map((edge) => ({
        id: edge.edge_id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: 'smoothstep',
        animated: edge.animated,
        label: edge.label,
        style: edge.style,
        data: edge.condition ? { condition: edge.condition } : undefined,
      }));

      setState((prev) => ({
        ...prev,
        flow,
        nodes: reactFlowNodes,
        edges: reactFlowEdges,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erro ao carregar flow:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [flowId, resourceId]);

  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  // ============================================
  // SAVE FLOW
  // ============================================
  const saveFlow = useCallback(async (nodesToSave?: ReactFlowNode[], edgesToSave?: ReactFlowEdge[]) => {
    if (!state.flow) return;

    try {
      setState((prev) => ({ ...prev, isSaving: true }));

      // Usar nodes/edges passados ou do estado
      const nodes = nodesToSave || state.nodes;
      const edges = edgesToSave || state.edges;

      // Converter nodes e edges para DTOs
      const nodeDtos: CreateNodeDto[] = nodes.map((node, index) => ({
        node_id: node.id,
        node_type: node.type,
        position_x: node.position.x,
        position_y: node.position.y,
        display_order: index,
        label: node.data.label,
        data: node.data,
      }));

      const edgeDtos: CreateEdgeDto[] = edges.map((edge) => ({
        edge_id: edge.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        edge_type: 'default',
        animated: edge.animated,
        label: edge.label,
        style: edge.style,
        condition: edge.data?.condition,
      }));

      // Salvar
      await flowService.saveFlowState(state.flow.id, {
        nodes: nodeDtos,
        edges: edgeDtos,
      });

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
      }));
    } catch (error) {
      console.error('Erro ao salvar flow:', error);
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  }, [state.flow, state.nodes, state.edges]);

  // Auto-save
  useEffect(() => {
    if (!autoSave || !state.flow) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveFlow();
    }, autoSaveInterval);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [autoSave, autoSaveInterval, state.nodes, state.edges, state.flow, saveFlow]);

  // ============================================
  // NODE OPERATIONS
  // ============================================
  const addNode = useCallback((type: NodeType, data: Partial<NodeData>, position?: { x: number; y: number }) => {
    const newNode: ReactFlowNode = {
      id: `node-${uuidv4()}`,
      type,
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: data as NodeData,
    };

    setState((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    return newNode;
  }, []);

  const updateNode = useCallback(async (nodeId: string, data: Partial<NodeData>) => {
    // Atualizar estado local e capturar nodes atualizados
    let updatedNodes: ReactFlowNode[] = [];
    
    setState((prev) => {
      updatedNodes = prev.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as NodeData }
          : node
      );
      
      return {
        ...prev,
        nodes: updatedNodes,
      };
    });

    // Salvar automaticamente com os nodes atualizados
    setTimeout(async () => {
      await saveFlow(updatedNodes, state.edges);
    }, 100);
  }, [saveFlow, state.edges]);

  const deleteNode = useCallback(async (nodeId: string) => {
    let updatedNodes: ReactFlowNode[] = [];
    let updatedEdges: ReactFlowEdge[] = [];
    
    setState((prev) => {
      updatedNodes = prev.nodes.filter((node) => node.id !== nodeId);
      updatedEdges = prev.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      
      return {
        ...prev,
        nodes: updatedNodes,
        edges: updatedEdges,
        selectedNode: prev.selectedNode?.id === nodeId ? null : prev.selectedNode,
      };
    });

    // Salvar automaticamente após deletar
    setTimeout(async () => {
      await saveFlow(updatedNodes, updatedEdges);
    }, 100);
  }, [saveFlow]);

  const selectNode = useCallback((node: ReactFlowNode | null) => {
    setState((prev) => ({ ...prev, selectedNode: node, selectedEdge: null }));
  }, []);

  // ============================================
  // EDGE OPERATIONS
  // ============================================
  const deleteEdge = useCallback(async (edgeId: string) => {
    let updatedEdges: ReactFlowEdge[] = [];
    
    setState((prev) => {
      updatedEdges = prev.edges.filter((edge) => edge.id !== edgeId);
      
      return {
        ...prev,
        edges: updatedEdges,
        selectedEdge: prev.selectedEdge?.id === edgeId ? null : prev.selectedEdge,
      };
    });

    // Salvar automaticamente após deletar edge
    setTimeout(async () => {
      await saveFlow(state.nodes, updatedEdges);
    }, 100);
  }, [saveFlow, state.nodes]);

  const selectEdge = useCallback((edge: ReactFlowEdge | null) => {
    setState((prev) => ({ ...prev, selectedEdge: edge, selectedNode: null }));
  }, []);

  // ============================================
  // FLOW OPERATIONS
  // ============================================
  const togglePublish = useCallback(async () => {
    if (!state.flow) return;

    try {
      const updatedFlow = await flowService.togglePublish(
        state.flow.id,
        !state.flow.is_published
      );

      setState((prev) => ({
        ...prev,
        flow: updatedFlow,
      }));
    } catch (error) {
      console.error('Erro ao publicar flow:', error);
    }
  }, [state.flow]);

  const clearCanvas = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdge: null,
    }));
  }, []);

  return {
    // State
    flow: state.flow,
    nodes: state.nodes,
    edges: state.edges,
    selectedNode: state.selectedNode,
    selectedEdge: state.selectedEdge,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,

    // Node operations
    addNode,
    updateNode,
    deleteNode,
    selectNode,

    // Edge operations
    deleteEdge,
    selectEdge,

    // Flow operations
    saveFlow,
    togglePublish,
    clearCanvas,
    reload: loadFlow,

    // Setters (para ReactFlow)
    setNodes: (nodes: ReactFlowNode[]) => setState((prev) => ({ ...prev, nodes })),
    setEdges: (edges: ReactFlowEdge[]) => setState((prev) => ({ ...prev, edges })),
  };
}
