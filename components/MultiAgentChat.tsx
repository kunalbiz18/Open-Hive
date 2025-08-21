'use client';

import React, { useState, useCallback } from 'react';
import { AgentSelection, MultiAgentSession } from '@/lib/multiAgentTypes';
import { getAgentsByCategory } from '@/lib/agents';
import { callMultiAgentAPI } from '@/lib/multiAgentClient';
import AgentSelector from './AgentSelector';
import SessionViewer from './SessionViewer';

export default function MultiAgentChat() {
  const [agentSelection, setAgentSelection] = useState<AgentSelection>({
    researcher: '',
    engineer: '',
    designer: '',
    critic: '',
    writer: ''
  });
  
  const [userQuery, setUserQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<MultiAgentSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAgentSelection = useCallback((category: keyof AgentSelection, agentId: string) => {
    setAgentSelection(prev => ({
      ...prev,
      [category]: agentId
    }));
  }, []);

  const isAgentSelectionComplete = useCallback(() => {
    return Object.values(agentSelection).every(id => id !== '');
  }, [agentSelection]);

  const handleSubmit = useCallback(async () => {
    if (!userQuery.trim() || !isAgentSelectionComplete()) {
      setError('Please provide a query and select agents for all categories');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentSession(null);

    try {
      const session = await callMultiAgentAPI(userQuery, agentSelection);
      setCurrentSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userQuery, agentSelection, isAgentSelectionComplete]);

  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setUserQuery('');
    setError(null);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Multi-Agent Chatbot
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select your expert agents and let them collaborate to solve your complex problems.
          Each agent brings specialized expertise to create comprehensive solutions.
        </p>
      </div>

      {!currentSession ? (
        <div className="space-y-6">
          {/* Agent Selection */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Select Your Expert Team
            </h2>
            <p className="text-gray-600 mb-6">
              Choose one agent from each category to form your expert team.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(['researcher', 'engineer', 'designer', 'critic', 'writer'] as const).map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900 capitalize">
                    {category}
                  </h3>
                  <AgentSelector
                    agents={getAgentsByCategory(category)}
                    selectedAgentId={agentSelection[category]}
                    onSelect={(agentId) => handleAgentSelection(category, agentId)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What would you like to accomplish?
            </h2>
            <div className="space-y-4">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Describe your problem, project, or question in detail..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              
              {error && (
                <div className="text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={handleSubmit}
                disabled={!isAgentSelectionComplete() || !userQuery.trim() || isLoading}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  isAgentSelectionComplete() && userQuery.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Processing...' : 'Start Multi-Agent Collaboration'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Session Controls */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Multi-Agent Session
            </h2>
            <button
              onClick={resetSession}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start New Session
            </button>
          </div>

          {/* Session Viewer */}
          <SessionViewer session={currentSession} />
        </div>
      )}
    </div>
  );
}