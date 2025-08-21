'use client';

import React from 'react';
import { Agent } from '@/lib/multiAgentTypes';

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgentId: string;
  onSelect: (agentId: string) => void;
}

export default function AgentSelector({ 
  agents, 
  selectedAgentId, 
  onSelect 
}: AgentSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="grid gap-2">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              selectedAgentId === agent.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onSelect(agent.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  selectedAgentId === agent.id ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {agent.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {agent.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.expertise.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {agent.expertise.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{agent.expertise.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedAgentId && (
        <div className="text-xs text-blue-600 font-medium">
          ✓ Selected: {agents.find(a => a.id === selectedAgentId)?.name}
        </div>
      )}
    </div>
  );
}