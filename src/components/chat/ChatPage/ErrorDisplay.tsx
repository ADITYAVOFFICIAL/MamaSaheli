import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
  showPreChat: boolean;
  setError: (e: string | null) => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, showPreChat, setError }) => (
  error && !showPreChat ? (
    <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 rounded-lg text-red-700 dark:text-red-300 text-sm shadow-sm my-2 mx-1">
      <Loader2 className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true"/>
      <span className="flex-1 break-words">{error}</span>
      <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-full -mr-1 ml-2 flex-shrink-0" aria-label="Dismiss error">×</Button>
    </div>
  ) : null
);

export default ErrorDisplay;
