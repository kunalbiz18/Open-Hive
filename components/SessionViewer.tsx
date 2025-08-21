'use client';

import React, { useState } from 'react';
import { MultiAgentSession } from '@/lib/multiAgentTypes';

interface SessionViewerProps {
  session: MultiAgentSession;
}

export default function SessionViewer({ session }: SessionViewerProps) {
  const [activeTab, setActiveTab] = useState<'workflow' | 'responses' | 'final'>('workflow');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'reducing': return 'bg-purple-100 text-purple-800';
      case 'collaborating': return 'bg-blue-100 text-blue-800';
      case 'executing': return 'bg-yellow-100 text-yellow-800';
      case 'planning': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'reducing': return '🔄';
      case 'collaborating': return '🤝';
      case 'executing': return '⚡';
      case 'planning': return '📋';
      default: return '⏳';
    }
  };

  const workflowSteps = [
    {
      id: 'planning',
      title: 'Planning & Query Enhancement',
      description: 'Leader analyzes and enhances the user query',
      status: session.status === 'completed' ? 'completed' : 
              ['planning', 'executing', 'collaborating', 'reducing', 'completed'].includes(session.status) ? 'completed' : 'pending'
    },
    {
      id: 'executing',
      title: 'Expert Execution',
      description: 'Selected agents work on their assigned tasks',
      status: session.status === 'completed' ? 'completed' : 
              ['executing', 'collaborating', 'reducing', 'completed'].includes(session.status) ? 'completed' : 'pending'
    },
    {
      id: 'collaborating',
      title: 'Agent Collaboration',
      description: 'Agents review and refine each other\'s work',
      status: session.status === 'completed' ? 'completed' : 
              ['collaborating', 'reducing', 'completed'].includes(session.status) ? 'completed' : 'pending'
    },
    {
      id: 'reducing',
      title: 'Synthesis & Final Output',
      description: 'Reducer merges all responses into final solution',
      status: session.status === 'completed' ? 'completed' : 'pending'
    }
  ];

  const primaryResponses = session.agentResponses.filter(r => !r.isCollaborative);
  const collaborativeResponses = session.agentResponses.filter(r => r.isCollaborative);

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Session Overview</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
            {getStatusIcon(session.status)} {session.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Original Query</p>
            <p className="text-gray-900 font-medium">{session.userQuery}</p>
          </div>
          {session.enhancedQuery && (
            <div>
              <p className="text-sm text-gray-600">Enhanced Query</p>
              <p className="text-gray-900 font-medium">{session.enhancedQuery}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'workflow', label: 'Workflow', count: workflowSteps.length },
              { id: 'responses', label: 'Agent Responses', count: primaryResponses.length },
              { id: 'final', label: 'Final Output', count: 1 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'workflow' | 'responses' | 'final')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Workflow Tab */}
          {activeTab === 'workflow' && (
            <div className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">{step.title}</h4>
                    <p className="text-gray-600">{step.description}</p>
                    {step.id === 'planning' && session.taskAssignments.length > 0 && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Task Assignments:</p>
                        <div className="space-y-2">
                          {session.taskAssignments.map((task, idx) => (
                            <div key={idx} className="text-sm text-gray-600">
                              <span className="font-medium">{task.agentId}:</span> {task.subtask}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Responses Tab */}
          {activeTab === 'responses' && (
            <div className="space-y-6">
              {primaryResponses.map((response, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {response.agentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{response.agentName}</h4>
                        <p className="text-sm text-gray-500 capitalize">{response.category}</p>
                      </div>
                    </div>
                    {response.subtask && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {response.subtask}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{response.content}</p>
                  </div>
                </div>
              ))}
              
              {collaborativeResponses.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Collaborative Refinements</h4>
                  <div className="space-y-4">
                    {collaborativeResponses.map((response, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-blue-600">{response.agentName}</span>
                          <span className="text-xs text-gray-500">refined</span>
                        </div>
                        <p className="text-sm text-gray-700">{response.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Final Output Tab */}
          {activeTab === 'final' && (
            <div className="space-y-4">
              {session.finalOutput ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-green-900 mb-3">Final Solution</h4>
                  <div className="prose prose-green max-w-none">
                    <p className="text-green-800 whitespace-pre-wrap">{session.finalOutput}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Final output is being generated...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}