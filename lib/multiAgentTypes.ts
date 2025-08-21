export type AgentRole = 'leader' | 'researcher' | 'engineer' | 'designer' | 'critic' | 'writer' | 'reducer';

export type AgentCategory = 'researcher' | 'engineer' | 'designer' | 'critic' | 'writer';

export type Agent = {
  id: string;
  name: string;
  category: AgentCategory;
  description: string;
  expertise: string[];
  personality: string;
  systemPrompt: string;
};

export type AgentResponse = {
  agentId: string;
  agentName: string;
  category: AgentCategory;
  content: string;
  timestamp: number;
  subtask?: string;
  confidence?: number;
  suggestions?: string[];
  isCollaborative?: boolean;
};

export type TaskAssignment = {
  agentId: string;
  subtask: string;
  priority: 'high' | 'medium' | 'low';
  context: string;
  expectedOutput: string;
};

export type MultiAgentMessage = {
  role: 'user' | 'system' | 'leader' | 'researcher' | 'engineer' | 'designer' | 'critic' | 'writer' | 'reducer';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: number;
  subtask?: string;
  isCollaborative?: boolean;
  references?: string[];
};

export type MultiAgentSession = {
  id: string;
  userQuery: string;
  enhancedQuery?: string;
  selectedAgents: Agent[];
  taskAssignments: TaskAssignment[];
  agentResponses: AgentResponse[];
  finalOutput?: string;
  status: 'initializing' | 'planning' | 'executing' | 'collaborating' | 'reducing' | 'completed';
  createdAt: number;
  updatedAt: number;
};

export type AgentSelection = {
  [K in AgentCategory]: string; // agent ID for each category
};

export type CollaborationRound = {
  round: number;
  responses: AgentResponse[];
  refinements: AgentResponse[];
  consensus?: string;
};