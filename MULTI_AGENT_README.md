# Multi-Agent Chatbot System

A sophisticated multi-agent collaboration system that orchestrates specialized AI agents to solve complex problems through coordinated expertise and collaborative refinement.

## 🎯 Overview

This system implements a multi-agent workflow similar to mgx.dev, where:

1. **Leader Agent** analyzes and enhances user queries
2. **Expert Agents** work on specialized tasks in parallel
3. **Collaboration Phase** allows agents to refine each other's work
4. **Reducer Agent** synthesizes everything into a coherent final solution

## 🏗️ Architecture

### Core Components

- **`MultiAgentOrchestrator`**: Main orchestration logic
- **`MultiAgentChat`**: React interface component
- **`AgentSelector`**: UI for choosing expert agents
- **`SessionViewer`**: Displays workflow and results
- **API Routes**: `/api/multi-agent` endpoint

### Agent Categories

Each category has multiple specialized agents to choose from:

#### 🔬 **Researcher**
- **Dr. Academic**: Academic research and scholarly analysis
- **Market Analyst**: Business intelligence and market research
- **Tech Researcher**: Technology trends and technical feasibility

#### ⚙️ **Engineer**
- **Software Architect**: System design and technical implementation
- **DevOps Engineer**: Infrastructure and operational excellence
- **Data Engineer**: Data pipelines and processing solutions

#### 🎨 **Designer**
- **UX Designer**: User experience and usability focus
- **Visual Designer**: Aesthetics and visual communication
- **Product Designer**: Product strategy and user value

#### 🧐 **Critic**
- **Constructive Critic**: Supportive feedback and improvement
- **Analytical Critic**: Logical analysis and objective evaluation
- **Devil's Advocate**: Challenging assumptions and risk identification

#### ✍️ **Writer**
- **Creative Writer**: Engaging storytelling and narratives
- **Technical Writer**: Clarity and user comprehension
- **Strategic Communicator**: Communication strategy and audience alignment

## 🚀 Usage

### 1. Access the System

Navigate to `/multi-agent` in your application to access the multi-agent interface.

### 2. Select Your Expert Team

Choose one agent from each of the five categories:
- Researcher
- Engineer
- Designer
- Critic
- Writer

### 3. Describe Your Problem

Provide a detailed description of what you want to accomplish. The more specific you are, the better the agents can collaborate.

### 4. Execute Collaboration

Click "Start Multi-Agent Collaboration" to begin the workflow:

1. **Planning Phase**: Leader enhances your query and assigns tasks
2. **Execution Phase**: Expert agents work on their specialized areas
3. **Collaboration Phase**: Agents review and refine each other's work
4. **Reduction Phase**: Final synthesis into coherent output

### 5. Review Results

The SessionViewer provides three tabs:
- **Workflow**: Step-by-step progress through the phases
- **Responses**: Individual agent contributions and refinements
- **Final Output**: Synthesized solution from all agents

## 🔧 Technical Implementation

### API Endpoint

```typescript
POST /api/multi-agent
{
  "userQuery": "Your problem description",
  "agentSelection": {
    "researcher": "researcher-academic",
    "engineer": "engineer-software",
    "designer": "designer-ux",
    "critic": "critic-constructive",
    "writer": "writer-technical"
  }
}
```

### Client Functions

```typescript
import { callMultiAgentAPI } from '@/lib/multiAgentClient';

const session = await callMultiAgentAPI(userQuery, agentSelection);
```

### Orchestration Flow

```typescript
import { MultiAgentOrchestrator } from '@/lib/multiAgentOrchestrator';

const orchestrator = new MultiAgentOrchestrator(userQuery, agentSelection);
const session = await orchestrator.execute();
```

## 🎨 Customization

### Adding New Agents

1. Define the agent in `lib/agents.ts`:
```typescript
{
  id: 'your-agent-id',
  name: 'Agent Name',
  category: 'researcher', // or other category
  description: 'Agent description',
  expertise: ['skill1', 'skill2'],
  personality: 'Agent personality description',
  systemPrompt: 'Detailed system prompt for the agent'
}
```

2. The agent will automatically appear in the selection interface.

### Modifying Agent Prompts

Edit the `systemPrompt` field in `lib/agents.ts` to customize how each agent behaves and responds.

### Custom Categories

To add new agent categories:
1. Update `AgentCategory` type in `lib/multiAgentTypes.ts`
2. Add category to `AgentSelection` type
3. Update the UI components to include the new category

## 🔍 Example Use Cases

### Product Development
- **Researcher**: Market analysis and user research
- **Engineer**: Technical feasibility and architecture
- **Designer**: UX/UI design and user experience
- **Critic**: Risk assessment and improvement suggestions
- **Writer**: Product messaging and documentation

### Business Strategy
- **Researcher**: Competitive analysis and market trends
- **Engineer**: Technology stack and implementation
- **Designer**: Brand identity and visual strategy
- **Critic**: Strategic risks and alternatives
- **Writer**: Communication strategy and messaging

### Technical Problem Solving
- **Researcher**: Best practices and current solutions
- **Engineer**: Technical implementation and architecture
- **Designer**: User interface and experience considerations
- **Critic**: Potential issues and edge cases
- **Writer**: Documentation and user guides

## 🚧 Future Enhancements

### Real-time Streaming
- Implement Server-Sent Events for live status updates
- Show agent responses as they're generated
- Real-time collaboration visualization

### Interactive Refinement
- Allow users to ask follow-up questions to specific agents
- Enable manual task reassignment during execution
- Support for iterative problem-solving cycles

### Advanced Orchestration
- Dynamic agent selection based on problem complexity
- Automatic task decomposition and assignment
- Multi-round collaboration with feedback loops

### Integration Features
- Export results to various formats (PDF, Markdown, etc.)
- Integration with project management tools
- API for external system integration

## 🐛 Troubleshooting

### Common Issues

1. **Agent Selection Incomplete**: Ensure all 5 categories have agents selected
2. **API Errors**: Check that the OpenRouter API is properly configured
3. **Slow Responses**: Complex queries may take time for full collaboration
4. **Parsing Errors**: The system includes fallbacks for malformed responses

### Debug Mode

Enable console logging to see detailed workflow information:
```typescript
// In the browser console
localStorage.setItem('debug-multi-agent', 'true');
```

## 📚 Dependencies

- **Next.js 15**: React framework
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Styling and UI components
- **OpenRouter API**: AI model access for agent reasoning

## 🤝 Contributing

To contribute to the multi-agent system:

1. Follow the existing code structure and patterns
2. Add comprehensive TypeScript types for new features
3. Include proper error handling and fallbacks
4. Test with various query types and agent combinations
5. Update documentation for any new features

## 📄 License

This multi-agent system is part of the AI Fiesta project and follows the same licensing terms.