import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ThinkingIndicatorProps {
  isLoading: boolean;
  streamingResponse: string;
  messages: any[];
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ isLoading, streamingResponse, messages }) => (
  isLoading && !streamingResponse && messages.length > 0 && messages[messages.length - 1].role === 'user' ? (
    <div className="flex items-center justify-center py-2 text-sm text-gray-500 dark:text-gray-400"><Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true"/>MamaSaheli is thinking...</div>
  ) : null
);

export default ThinkingIndicator;
