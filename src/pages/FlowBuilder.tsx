import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';

import { FlowCanvas } from '@/components/flow/builder/FlowCanvas';
import { FlowSidebar } from '@/components/flow/builder/FlowSidebar';
import { FlowToolbar } from '@/components/flow/builder/FlowToolbar';
import { NodeEditor } from '@/components/flow/shared/NodeEditor';
import { FlowPreviewModal, FlowPublicModal } from '@/components/flow/preview';
import { useFlowBuilder } from '@/hooks/flow/useFlowBuilder';
import type { ReactFlowNode, NodeType, NodeData, FlowNode } from '@/types/flow.types';

export default function FlowBuilder() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const {
    flow,
    nodes,
    edges,
    selectedNode,
    isLoading,
    isSaving,
    lastSaved,
    addNode,
    updateNode,
    deleteNode,
    deleteEdge,
    selectNode,
    saveFlow,
    togglePublish,
    clearCanvas,
    setNodes,
    setEdges,
  } = useFlowBuilder({
    flowId,
    autoSave: false, // Auto-save desabilitado
  });

  // ============================================
  // CALLBACKS
  // ============================================
  const handleAddNode = useCallback(
    (type: NodeType, data: Partial<NodeData>) => {
      // Adicionar node no centro do canvas
      const position = {
        x: 250 + Math.random() * 100,
        y: 100 + nodes.length * 150,
      };
      addNode(type, data, position);
    },
    [addNode, nodes.length]
  );

  const handleNodeClick = useCallback(
    (node: ReactFlowNode) => {
      selectNode(node);
    },
    [selectNode]
  );

  const handleNodesChange = useCallback(
    (newNodes: ReactFlowNode[]) => {
      setNodes(newNodes);
    },
    [setNodes]
  );

  const handleEdgesChange = useCallback(
    (newEdges: any) => {
      setEdges(newEdges);
    },
    [setEdges]
  );

  const handleSave = useCallback(async () => {
    await saveFlow();
  }, [saveFlow]);

  const handlePreview = useCallback(() => {
    setShowPreview(true);
  }, []);

  const handlePublish = useCallback(async () => {
    await togglePublish();
  }, [togglePublish]);

  const handleClear = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    clearCanvas();
  }, [clearCanvas]);

  const handleBack = useCallback(() => {
    navigate('/flows');
  }, [navigate]);

  const handleNodeDrop = useCallback(
    (type: string, data: any, position: { x: number; y: number }) => {
      addNode(type as NodeType, data, position);
    },
    [addNode]
  );

  // ============================================
  // RENDER
  // ============================================
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Carregando fluxo...</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flow não encontrado</h2>
          <p className="text-gray-600 mb-6">
            O fluxo que você está procurando não existe ou foi removido.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <FlowToolbar
        flowName={flow.flow_name}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isPublished={flow.is_published}
        onSave={handleSave}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onClear={handleClear}
        onBack={handleBack}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FlowSidebar onAddNode={handleAddNode} />

        {/* Canvas */}
        <div className="flex-1 relative">
          <FlowCanvas
            initialNodes={nodes}
            initialEdges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onNodeClick={handleNodeClick}
            onNodeDrop={handleNodeDrop}
            onDeleteEdge={deleteEdge}
            onDeleteNode={deleteNode}
          />

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8 border-2 border-dashed border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Comece criando seu fluxo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Arraste componentes da barra lateral ou clique neles para adicionar ao canvas.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Comece com um node "Iniciar"</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Editor Panel */}
        {selectedNode && (
          <NodeEditor
            node={selectedNode}
            flowId={flow?.id}
            onClose={() => selectNode(null)}
            onUpdate={updateNode}
            onDelete={deleteNode}
          />
        )}
      </div>

      {/* Preview Modal - Condicional baseado em is_published */}
      {showPreview && flow && (
        <>
          {flow.is_published ? (
            // Fluxo PUBLICADO - Usa FlowPublicModal (SALVA leads no banco)
            <FlowPublicModal
              flow={flow}
              nodes={nodes.map((n) => ({
                id: n.id,
                flow_id: flow.id,
                node_id: n.id,
                node_type: n.type,
                position_x: n.position.x,
                position_y: n.position.y,
                display_order: 0,
                data: n.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as FlowNode))}
              edges={edges.map((e) => ({
                id: e.id,
                flow_id: flow.id,
                edge_id: e.id,
                source_node_id: e.source,
                target_node_id: e.target,
                edge_type: 'default',
                animated: e.animated || false,
                created_at: new Date().toISOString(),
              }))}
              onClose={() => setShowPreview(false)}
            />
          ) : (
            // Fluxo NÃO PUBLICADO - Usa FlowPreviewModal (NÃO salva leads)
            <FlowPreviewModal
              flow={flow}
              nodes={nodes.map((n) => ({
                id: n.id,
                flow_id: flow.id,
                node_id: n.id,
                node_type: n.type,
                position_x: n.position.x,
                position_y: n.position.y,
                display_order: 0,
                data: n.data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as FlowNode))}
              edges={edges.map((e) => ({
                id: e.id,
                flow_id: flow.id,
                edge_id: e.id,
                source_node_id: e.source,
                target_node_id: e.target,
                edge_type: 'default',
                animated: e.animated || false,
                created_at: new Date().toISOString(),
              }))}
              onClose={() => setShowPreview(false)}
            />
          )}
        </>
      )}

      {/* Clear Canvas Confirmation Modal */}
      <ConfirmModal
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        title="Limpar Canvas"
        description="Tem certeza que deseja limpar todo o canvas? Esta ação removerá todos os componentes e conexões. Esta ação não pode ser desfeita."
        confirmText="Sim, limpar tudo"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={handleConfirmClear}
      />
    </div>
  );
}
