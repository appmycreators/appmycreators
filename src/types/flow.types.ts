// ============================================
// FLOW TYPES - Sistema de Fluxos de Mensagens
// ============================================

// ============================================
// Database Types
// ============================================

export interface Flow {
  id: string;
  user_id: string;
  resource_id: string | null;
  flow_name: string;
  description?: string;
  bot_name?: string;
  avatar_url?: string;
  theme: 'light' | 'dark';
  primary_color: string;
  background_color: string;
  show_progress: boolean;
  allow_back: boolean;
  auto_save: boolean;
  is_published: boolean;
  total_steps: number;
  estimated_time?: number;
  created_at: string;
  updated_at: string;
}

export interface FlowNode {
  id: string;
  flow_id: string;
  node_id: string;
  node_type: NodeType;
  position_x: number;
  position_y: number;
  display_order: number;
  label?: string;
  data: NodeData;
  created_at: string;
  updated_at: string;
}

export interface FlowEdge {
  id: string;
  flow_id: string;
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: EdgeType;
  label?: string;
  animated: boolean;
  style?: Record<string, any>;
  condition?: EdgeCondition;
  created_at: string;
}

export interface FlowResponse {
  id: string;
  flow_id: string;
  user_id?: string;
  session_id: string;
  responses: Record<string, ResponseValue>;
  current_node_id?: string;
  completed: boolean;
  completed_at?: string;
  started_at: string;
  last_interaction_at: string;
  time_spent: number;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  created_at: string;
}

// ============================================
// Node Types
// ============================================

export type NodeType = 'start' | 'message' | 'media' | 'input' | 'delay' | 'end';

export type EdgeType = 'default' | 'conditional' | 'button';

// Node Data por tipo
export type NodeData = 
  | StartNodeData 
  | MessageNodeData 
  | MediaNodeData 
  | InputNodeData 
  | DelayNodeData
  | EndNodeData;

export interface StartNodeData {
  type: 'start';
  welcomeMessage: string;
  showStartButton: boolean;
  buttonText: string;
  buttonColor?: string;
  avatar?: string;
  avatarName?: string;
  waitForInteraction?: boolean; // Aguardar clique para continuar
}

export interface MessageNodeData {
  type: 'message';
  content: string;
  format: 'text' | 'markdown';
  waitForInteraction?: boolean; // Aguardar clique para continuar
}

export interface MediaNodeData {
  type: 'media';
  mediaType: 'image' | 'video' | 'audio';
  mediaUrl: string;
  thumbnail?: string; // Para vídeos
  caption?: string;
  autoPlay?: boolean;
  controls?: boolean;
  waitForInteraction?: boolean; // Aguardar clique para continuar
}

export interface InputNodeData {
  type: 'input';
  inputType: InputType;
  placeholder: string;
  required: boolean;
  label?: string;
  validation?: ValidationRule;
  options?: SelectOption[]; // Para select/multiselect
  variable: string; // Nome da variável para salvar
  dbField?: 'name' | 'email' | 'phone' | 'none'; // Campo do banco para mapear
}

export interface DelayNodeData {
  type: 'delay';
  duration: number; // Duração em milissegundos
  showTyping: boolean; // Mostrar indicador de digitação
  label?: string; // Descrição do delay (ex: "Aguardando resposta...")
}

export interface EndNodeData {
  type: 'end';
  thankYouMessage: string;
  redirectUrl?: string;
  showRestartButton: boolean;
  restartButtonText?: string;
}

// ============================================
// Input Types
// ============================================

export type InputType = 
  | 'text' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'multiselect'
  | 'date'
  | 'time';

export interface SelectOption {
  label: string;
  value: string;
}

export interface ValidationRule {
  type: 'regex' | 'min' | 'max' | 'email' | 'phone' | 'required';
  value?: string | number;
  message: string;
}

// ============================================
// Edge Conditions
// ============================================

export interface EdgeCondition {
  field: string; // Nome da variável do input
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'notEmpty';
  value: string | number;
  caseSensitive?: boolean;
}

// ============================================
// Response Types
// ============================================

export interface ResponseValue {
  value: any;
  timestamp: string;
  nodeType: NodeType;
}

// ============================================
// ReactFlow Types (compatibilidade)
// ============================================

export interface ReactFlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData & {
    label?: string;
    onEdit?: (nodeId: string) => void;
    onDelete?: (nodeId: string) => void;
  };
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  label?: string;
  style?: Record<string, any>;
  data?: {
    condition?: EdgeCondition;
  };
}

// ============================================
// Builder State Types
// ============================================

export interface FlowBuilderState {
  flow: Flow | null;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  selectedNode: ReactFlowNode | null;
  selectedEdge: ReactFlowEdge | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

// ============================================
// Preview/Runtime Types
// ============================================

export interface FlowRuntimeState {
  currentNodeId: string;
  responses: Record<string, ResponseValue>;
  isCompleted: boolean;
  sessionId: string;
  startedAt: Date;
  history: string[]; // Array de node_ids visitados
}

// ============================================
// Statistics Types
// ============================================

export interface FlowStats {
  total_responses: number;
  completed_responses: number;
  completion_rate: number;
  avg_time_spent: number;
  last_response_at: string | null;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateFlowDto {
  resource_id: string;
  flow_name: string;
  description?: string;
  theme?: 'light' | 'dark';
  primary_color?: string;
  background_color?: string;
}

export interface UpdateFlowDto {
  flow_name?: string;
  description?: string;
  theme?: 'light' | 'dark';
  primary_color?: string;
  background_color?: string;
  show_progress?: boolean;
  allow_back?: boolean;
  auto_save?: boolean;
  is_published?: boolean;
}

export interface CreateNodeDto {
  node_id: string;
  node_type: NodeType;
  position_x: number;
  position_y: number;
  display_order: number;
  label?: string;
  data: NodeData;
}

export interface UpdateNodeDto {
  position_x?: number;
  position_y?: number;
  display_order?: number;
  label?: string;
  data?: NodeData;
}

export interface CreateEdgeDto {
  edge_id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type?: EdgeType;
  label?: string;
  animated?: boolean;
  style?: Record<string, any>;
  condition?: EdgeCondition;
}

export interface SaveFlowStateDto {
  nodes: CreateNodeDto[];
  edges: CreateEdgeDto[];
}

export interface SubmitResponseDto {
  session_id: string;
  node_id: string;
  value: any;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}

// ============================================
// Helper Types
// ============================================

export interface FlowComplete {
  flow: Flow;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export type NodeTemplate = {
  type: NodeType;
  label: string;
  icon: string;
  defaultData: NodeData;
  description: string;
};
