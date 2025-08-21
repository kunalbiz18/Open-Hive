'use client';

import React from 'react';

interface ChatInterfaceProps {
  // This component can be expanded for future interactive features
  // For now, it's a placeholder that can be used for real-time chat
  placeholder?: string;
}

export default function ChatInterface({ placeholder }: ChatInterfaceProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Chat Interface</h3>
      <p className="text-gray-600">
        {placeholder || "This component can be expanded for real-time interaction with agents."}
      </p>
    </div>
  );
}