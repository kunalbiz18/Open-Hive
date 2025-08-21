import { MultiAgentSession, AgentSelection, AgentResponse } from './multiAgentTypes';

export async function callMultiAgentAPI(
  userQuery: string,
  agentSelection: AgentSelection
): Promise<MultiAgentSession> {
  try {
    const response = await fetch('/api/multi-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userQuery,
        agentSelection,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.session;
  } catch (error) {
    console.error('Error calling multi-agent API:', error);
    throw error;
  }
}

export async function streamMultiAgentAPI(
  userQuery: string,
  agentSelection: AgentSelection,
  handlers: {
    onStatusUpdate?: (status: string) => void;
    onAgentResponse?: (response: AgentResponse) => void;
    onFinalOutput?: (output: string) => void;
    onError?: (error: string) => void;
    onComplete?: (session: MultiAgentSession) => void;
  }
): Promise<void> {
  try {
    // For now, we'll use the regular API call since streaming would require more complex implementation
    // In a production system, you might want to implement Server-Sent Events or WebSocket for real-time updates
    
    handlers.onStatusUpdate?.('initializing');
    
    const session = await callMultiAgentAPI(userQuery, agentSelection);
    
    // Simulate status updates based on the completed session
    if (session.status === 'completed') {
      handlers.onStatusUpdate?.('planning');
      handlers.onStatusUpdate?.('executing');
      handlers.onStatusUpdate?.('collaborating');
      handlers.onStatusUpdate?.('reducing');
      handlers.onStatusUpdate?.('completed');
      
      // Emit agent responses
      session.agentResponses.forEach(response => {
        handlers.onAgentResponse?.(response);
      });
      
      // Emit final output
      if (session.finalOutput) {
        handlers.onFinalOutput?.(session.finalOutput);
      }
      
      handlers.onComplete?.(session);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    handlers.onError?.(errorMessage);
  }
}