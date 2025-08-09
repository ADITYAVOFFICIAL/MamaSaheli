import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingHistoryProps {
  isLoading: boolean;
  messages: unknown[];
  currentSessionId: string | null;
  isStartingChat: boolean;
}

const LoadingHistory: React.FC<LoadingHistoryProps> = ({ isLoading, messages, currentSessionId, isStartingChat }) => (
  isLoading && messages.length === 0 && currentSessionId && !isStartingChat ? (
    <div className="flex justify-center items-center h-full text-sm text-gray-500 dark:text-gray-400"><Loader2 className="h-5 w-5 animate-spin mr-2" aria-hidden="true"/>Loading chat history...</div>
  ) : null
);

export default LoadingHistory;
