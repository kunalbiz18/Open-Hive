import { 
  MultiAgentSession, 
  AgentResponse, 
  TaskAssignment, 
  AgentSelection,
  MultiAgentMessage,
  Agent
} from './multiAgentTypes';
import { getAgentById } from './agents';
import { callOpenRouter } from './client';

export class MultiAgentOrchestrator {
  private session: MultiAgentSession;
  private selectedAgents: Map<string, Agent>; // Map of agentId to Agent object

  constructor(userQuery: string, agentSelection: AgentSelection) {
    this.selectedAgents = new Map();
    
    // Initialize session
    this.session = {
      id: this.generateSessionId(),
      userQuery,
      selectedAgents: [],
      taskAssignments: [],
      agentResponses: [],
      status: 'initializing',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Load selected agents
    Object.entries(agentSelection).forEach(([, agentId]) => {
      const agent = getAgentById(agentId);
      if (agent) {
        this.selectedAgents.set(agentId, agent);
        this.session.selectedAgents.push(agent);
      }
    });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async callModel(messages: MultiAgentMessage[], agentId: string): Promise<string> {
    try {
      const agent = this.selectedAgents.get(agentId) || getAgentById(agentId);
      if (!agent) {
        throw new Error(`Agent ${agentId} not found`);
      }

      // Convert to ChatMessage format for the existing client
      const chatMessages = messages.map(msg => ({
        role: (msg.role === 'user' ? 'user' : 
               msg.role === 'system' ? 'system' : 'assistant') as 'user' | 'assistant' | 'system',
        content: msg.content,
        ts: msg.timestamp
      }));

      // Add system prompt for the specific agent
      const systemMessage = {
        role: 'system' as const,
        content: agent.systemPrompt,
        ts: Date.now()
      };

      const allMessages = [systemMessage, ...chatMessages];

      const response = await callOpenRouter({
        model: 'anthropic/claude-3.5-sonnet', // Using a capable model for agent reasoning
        messages: allMessages,
        apiKey: undefined // Will use shared key
      });

      if (response.error) {
        throw new Error(`Model call failed: ${response.error}`);
      }

      return response.choices?.[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error(`Error calling model for agent ${agentId}:`, error);
      return `Error: Unable to generate response for ${agentId}`;
    }
  }

  private async executeLeaderPhase(): Promise<void> {
    this.session.status = 'planning';
    this.session.updatedAt = Date.now();

    const leaderMessages: MultiAgentMessage[] = [
      {
        role: 'user',
        content: this.session.userQuery,
        timestamp: Date.now()
      }
    ];

    // Leader enhances the query and creates task assignments
    const leaderResponse = await this.callModel(leaderMessages, 'leader');
    
    // Parse leader response to extract enhanced query and task assignments
    const enhancedQuery = this.extractEnhancedQuery(leaderResponse);
    const taskAssignments = this.parseTaskAssignments(leaderResponse);

    this.session.enhancedQuery = enhancedQuery;
    this.session.taskAssignments = taskAssignments;
  }

  private extractEnhancedQuery(leaderResponse: string): string {
    // Simple extraction - in production, you might want more sophisticated parsing
    const lines = leaderResponse.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('enhanced query:') || 
          line.toLowerCase().includes('improved query:') ||
          line.toLowerCase().includes('expanded query:')) {
        return line.split(':')[1]?.trim() || this.session.userQuery;
      }
    }
    return this.session.userQuery;
  }

  private parseTaskAssignments(leaderResponse: string): TaskAssignment[] {
    const assignments: TaskAssignment[] = [];
    const lines = leaderResponse.split('\n');
    
    let currentAssignment: Partial<TaskAssignment> = {};
    
    for (const line of lines) {
      if (line.toLowerCase().includes('agent:') || line.toLowerCase().includes('assign to:')) {
        // Save previous assignment if complete
        if (currentAssignment.agentId && currentAssignment.subtask) {
          assignments.push({
            agentId: currentAssignment.agentId,
            subtask: currentAssignment.subtask,
            priority: currentAssignment.priority || 'medium',
            context: currentAssignment.context || '',
            expectedOutput: currentAssignment.expectedOutput || ''
          });
        }
        
        // Start new assignment
        const agentMatch = line.match(/agent:\s*(\w+)/i) || line.match(/assign to:\s*(\w+)/i);
        if (agentMatch) {
          currentAssignment = { agentId: agentMatch[1] };
        }
      } else if (line.toLowerCase().includes('task:') || line.toLowerCase().includes('subtask:')) {
        const taskMatch = line.match(/task:\s*(.+)/i) || line.match(/subtask:\s*(.+)/i);
        if (taskMatch) {
          currentAssignment.subtask = taskMatch[1].trim();
        }
      } else if (line.toLowerCase().includes('priority:')) {
        const priorityMatch = line.match(/priority:\s*(high|medium|low)/i);
        if (priorityMatch) {
          currentAssignment.priority = priorityMatch[1] as 'high' | 'medium' | 'low';
        }
      }
    }
    
    // Add final assignment
    if (currentAssignment.agentId && currentAssignment.subtask) {
      assignments.push({
        agentId: currentAssignment.agentId,
        subtask: currentAssignment.subtask,
        priority: currentAssignment.priority || 'medium',
        context: currentAssignment.context || '',
        expectedOutput: currentAssignment.expectedOutput || ''
      });
    }
    
    return assignments;
  }

  private async executeExpertPhase(): Promise<void> {
    this.session.status = 'executing';
    this.session.updatedAt = Date.now();

    const expertResponses: AgentResponse[] = [];

    // Execute tasks in parallel for all assigned agents
    const executionPromises = this.session.taskAssignments.map(async (assignment) => {
      const agent = this.selectedAgents.get(assignment.agentId);
      if (!agent) return;

      const messages: MultiAgentMessage[] = [
        {
          role: 'user',
          content: `Task: ${assignment.subtask}\n\nContext: ${assignment.context}\n\nExpected Output: ${assignment.expectedOutput}`,
          timestamp: Date.now()
        }
      ];

      const response = await this.callModel(messages, assignment.agentId);
      
      const agentResponse: AgentResponse = {
        agentId: assignment.agentId,
        agentName: agent.name,
        category: agent.category,
        content: response,
        timestamp: Date.now(),
        subtask: assignment.subtask,
        confidence: 0.8, // Default confidence
        suggestions: []
      };

      expertResponses.push(agentResponse);
    });

    await Promise.all(executionPromises);
    this.session.agentResponses = expertResponses;
  }

  private async executeCollaborationPhase(): Promise<void> {
    this.session.status = 'collaborating';
    this.session.updatedAt = Date.now();

    // Create a collaborative discussion where agents can see and refine each other's responses
    const collaborationMessages: MultiAgentMessage[] = [
      {
        role: 'system',
        content: 'This is a collaborative discussion. Each agent can see the responses of others and provide refinements or additional insights.',
        timestamp: Date.now()
      }
    ];

    // Add all expert responses to the collaboration
    this.session.agentResponses.forEach(response => {
      collaborationMessages.push({
        role: response.category as 'researcher' | 'engineer' | 'designer' | 'critic' | 'writer',
        content: response.content,
        agentId: response.agentId,
        agentName: response.agentName,
        timestamp: response.timestamp,
        subtask: response.subtask,
        isCollaborative: true
      });
    });

    // Allow each agent to provide refinements based on others' responses
    const refinementPromises = this.session.selectedAgents.map(async (agent) => {
      const messages: MultiAgentMessage[] = [
        ...collaborationMessages,
        {
          role: 'system',
          content: `As ${agent.name}, review the responses from your colleagues and provide any refinements, additional insights, or collaborative input.`,
          timestamp: Date.now()
        }
      ];

      const refinement = await this.callModel(messages, agent.id);
      
      if (refinement && !refinement.includes('Error:')) {
        const refinementResponse: AgentResponse = {
          agentId: agent.id,
          agentName: agent.name,
          category: agent.category,
          content: refinement,
          timestamp: Date.now(),
          isCollaborative: true,
          confidence: 0.9
        };
        
        this.session.agentResponses.push(refinementResponse);
      }
    });

    await Promise.all(refinementPromises);
  }

  private async executeReducerPhase(): Promise<void> {
    this.session.status = 'reducing';
    this.session.updatedAt = Date.now();

    // Prepare all responses for the reducer
    const allResponses = this.session.agentResponses
      .filter(response => !response.isCollaborative) // Focus on primary responses
      .map(response => `${response.agentName} (${response.category}): ${response.content}`)
      .join('\n\n');

    const reducerMessages: MultiAgentMessage[] = [
      {
        role: 'user',
        content: `Original Query: ${this.session.userQuery}\n\nEnhanced Query: ${this.session.enhancedQuery}\n\nExpert Responses:\n\n${allResponses}\n\nPlease synthesize these responses into a coherent, comprehensive final output.`,
        timestamp: Date.now()
      }
    ];

    const finalOutput = await this.callModel(reducerMessages, 'reducer');
    
    this.session.finalOutput = finalOutput;
    this.session.status = 'completed';
    this.session.updatedAt = Date.now();
  }

  public async execute(): Promise<MultiAgentSession> {
    try {
      // Step 1: Leader phase
      await this.executeLeaderPhase();
      
      // Step 2: Expert phase
      await this.executeExpertPhase();
      
      // Step 3: Collaboration phase
      await this.executeCollaborationPhase();
      
      // Step 4: Reducer phase
      await this.executeReducerPhase();
      
      return this.session;
    } catch (error) {
      console.error('Error in multi-agent execution:', error);
      this.session.status = 'completed';
      this.session.finalOutput = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      return this.session;
    }
  }

  public getSession(): MultiAgentSession {
    return this.session;
  }

  public getStatus(): string {
    return this.session.status;
  }
}

// Convenience function for easy usage
export async function callMultiAgent(
  userQuery: string, 
  agentSelection: AgentSelection
): Promise<MultiAgentSession> {
  const orchestrator = new MultiAgentOrchestrator(userQuery, agentSelection);
  return await orchestrator.execute();
}