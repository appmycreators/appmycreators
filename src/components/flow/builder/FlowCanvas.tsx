import { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, MessageNode, MediaNode, InputNode, DelayNode, EndNode } from './nodes';
import type { ReactFlowNode, ReactFlowEdge } from '@/types/flow.types';

interface FlowCanvasProps {
  initialNodes?: ReactFlowNode[];
  initialEdges?: ReactFlowEdge[];
  onNodesChange?: (nodes: ReactFlowNode[]) => void;
  onEdgesChange?: (edges: ReactFlowEdge[]) => void;
  onNodeClick?: (node: ReactFlowNode) => void;
  onEdgeClick?: (edge: ReactFlowEdge) => void;
  onNodeDrop?: (type: string, data: any, position: { x: number; y: number }) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  media: MediaNode,
  input: InputNode,
  delay: DelayNode,
  end: EndNode,
};

export function FlowCanvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  onNodeDrop,
  onDeleteEdge,
  onDeleteNode,
}: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges as Edge[]);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Sincronizar nodes quando initialNodes mudar (ex: addNode do useFlowBuilder)
  useEffect(() => {
    setNodes(initialNodes as Node[]);
  }, [initialNodes, setNodes]);

  // Sincronizar edges quando initialEdges mudar
  useEffect(() => {
    setEdges(initialEdges as Edge[]);
  }, [initialEdges, setEdges]);

  // Ref para armazenar os nodes atualizados
  const nodesRef = useRef(nodes);
  
  // Atualizar ref quando nodes mudam
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Callback quando nodes mudam
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      
      // Notificar o pai após mudanças (como arrastar/mover nodes)
      if (onNodesChange) {
        // Aguardar para pegar estado atualizado
        requestAnimationFrame(() => {
          onNodesChange(nodesRef.current as ReactFlowNode[]);
        });
      }
    },
    [onNodesChangeInternal, onNodesChange]
  );

  // Callback quando edges mudam
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      // Não notificar o pai aqui - causa loop infinito
    },
    [onEdgesChangeInternal]
  );

  // Callback quando nova conexão é criada
  const onConnect = useCallback(
    (connection: Connection) => {
      // VALIDAÇÃO: Impedir conexões no mesmo node
      if (connection.source === connection.target) {
        console.warn('Não é possível conectar um node a ele mesmo');
        return;
      }

      const newEdge = {
        ...connection,
        id: `edge-${connection.source}-${connection.target}`,
        type: 'smoothstep',
        animated: true,
      };
      
      // Adicionar edge ao estado local
      const updatedEdges = addEdge(newEdge as Edge, edges);
      setEdges(updatedEdges);
      
      // IMPORTANTE: Notificar o pai sobre a nova conexão
      if (onEdgesChange) {
        // Usar setTimeout para garantir que o estado foi atualizado
        setTimeout(() => {
          onEdgesChange(updatedEdges as ReactFlowEdge[]);
        }, 0);
      }
    },
    [edges, setEdges, onEdgesChange]
  );

  // Callback quando node é clicado
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setSelectedEdge(null);
      if (onNodeClick) {
        onNodeClick(node as ReactFlowNode);
      }
    },
    [onNodeClick]
  );

  // Callback quando edge é clicado
  const handleEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setSelectedEdge(edge.id);
      setSelectedNode(null);
      if (onEdgeClick) {
        onEdgeClick(edge as ReactFlowEdge);
      }
    },
    [onEdgeClick]
  );

  // Callback para clique no pane (fundo)
  const handlePaneClick = useCallback(() => {
    setSelectedEdge(null);
    setSelectedNode(null);
  }, []);

  // Handler para teclas Delete/Backspace
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ignorar se o usuário está editando texto em inputs/textareas
      const target = event.target as HTMLElement;
      const isEditingText = 
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isEditingText) {
        return; // Não deletar nodes/edges enquanto edita texto
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedEdge && onDeleteEdge) {
          onDeleteEdge(selectedEdge);
          setSelectedEdge(null);
        } else if (selectedNode && onDeleteNode) {
          onDeleteNode(selectedNode);
          setSelectedNode(null);
        }
      }
    },
    [selectedEdge, selectedNode, onDeleteEdge, onDeleteNode]
  );

  // Adicionar listener para teclas
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handler para drag & drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeDataStr = event.dataTransfer.getData('nodeData');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      // Usar ReactFlow para converter coordenadas corretamente
      let position = { x: 0, y: 0 };
      
      if (reactFlowInstance.current && reactFlowWrapper.current) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        position = reactFlowInstance.current.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });
      }

      let nodeData = {};
      try {
        nodeData = JSON.parse(nodeDataStr);
      } catch (e) {
        console.error('Erro ao parsear nodeData:', e);
      }

      if (onNodeDrop) {
        onNodeDrop(type, nodeData, position);
      }
    },
    [onNodeDrop]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  return (
    <div 
      ref={reactFlowWrapper}
      className="w-full h-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls className="bg-white rounded-lg shadow-lg border border-gray-200" />
        <MiniMap
          className="bg-white rounded-lg shadow-lg border border-gray-200"
          nodeColor={(node) => {
            switch (node.type) {
              case 'start': return '#3b82f6';
              case 'message': return '#a855f7';
              case 'media': return '#22c55e';
              case 'input': return '#f97316';
              case 'end': return '#10b981';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}
