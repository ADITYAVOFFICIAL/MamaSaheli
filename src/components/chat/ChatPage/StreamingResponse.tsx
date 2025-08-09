import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StreamingResponseProps {
  streamingResponse: string;
}

const StreamingResponse: React.FC<StreamingResponseProps> = ({ streamingResponse }) => (
  streamingResponse ? (
    <div className="flex items-start space-x-2 justify-start pr-8 sm:pr-10 animate-fade-in">
      <div className="relative max-w-[85%] rounded-xl shadow-sm flex flex-col bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600 items-start">
        <div className="px-3 py-1 sm:px-4 sm:py-1.5 first:pt-2 last:pb-2 w-full">
          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-a:text-mamasaheli-primary hover:prose-a:text-mamasaheli-dark dark:prose-a:text-mamasaheli-light dark:hover:prose-a:text-blue-300 whitespace-pre-wrap">
            {streamingResponse}
            <span className="inline-block animate-pulse ml-1">▍</span>
          </div>
        </div>
      </div>
    </div>
  ) : null
);

export default StreamingResponse;
