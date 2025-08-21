import { NextRequest, NextResponse } from 'next/server';
import { callMultiAgent } from '@/lib/multiAgentOrchestrator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userQuery, agentSelection } = body;

    if (!userQuery || !agentSelection) {
      return NextResponse.json(
        { error: 'Missing required fields: userQuery and agentSelection' },
        { status: 400 }
      );
    }

    // Validate agent selection
    const requiredCategories = ['researcher', 'engineer', 'designer', 'critic', 'writer'];
    const missingCategories = requiredCategories.filter(category => !agentSelection[category]);
    
    if (missingCategories.length > 0) {
      return NextResponse.json(
        { error: `Missing agent selection for categories: ${missingCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Execute multi-agent workflow
    const session = await callMultiAgent(userQuery, agentSelection);

    return NextResponse.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Error in multi-agent API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Multi-Agent API endpoint',
    usage: 'POST with userQuery and agentSelection'
  });
}