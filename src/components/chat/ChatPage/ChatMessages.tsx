import React from 'react';
import { Loader2, Bot, User, Bookmark, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatMessagePart {
  type: 'text' | 'image';
  content: string;
  alt?: string;
}

export interface ChatUIMessage {
  role: 'user' | 'model';
  parts: ChatMessagePart[];
}

interface ChatMessagesProps {
  messages: ChatUIMessage[];
  currentSessionId: string | null;
  isLoading: boolean;
  handleBookmarkClick: (content: string) => void;
  error: string | null;
  showPreChat: boolean;
  setError: (e: string | null) => void;
}

const Anchor = (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a target="_blank" rel="noopener noreferrer" {...props} />;

const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentSessionId,
  isLoading,
  handleBookmarkClick,
  error,
  showPreChat,
  setError
}) => (
  <>
    {messages.map((message, index) => {
      if (!message || !message.role || !Array.isArray(message.parts)) return null;
      const uniqueKey = `${currentSessionId || 'new'}-${message.role}-${index}`;
      return (
        <div
          key={uniqueKey}
          className={`flex items-start space-x-2 animate-fade-in ${message.role === 'user' ? 'justify-end pl-8 sm:pl-10' : 'justify-start pr-8 sm:pr-10'}`}
        >
          {message.role === 'model' && (<Bot className="h-5 w-5 text-mamasaheli-primary/80 dark:text-mamasaheli-light/80 mt-1 flex-shrink-0 self-start" aria-label="AI Icon" />)}
          <div className={`relative group max-w-[85%] rounded-xl shadow-sm flex flex-col ${ message.role === 'user' ? 'bg-mamasaheli-primary text-white rounded-br-none items-end' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600 items-start' }`} >
            {message.parts.map((part, partIndex) => (
              <div key={`${uniqueKey}-part-${partIndex}`} className={`px-3 py-1 sm:px-4 sm:py-1.5 first:pt-2 last:pb-2 w-full ${part.type === 'image' ? 'my-1 flex justify-center' : ''}`} >
                {part.type === 'text' && part.content ? (
                  <div className={`prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0.5 ${message.role === 'user' ? 'text-white prose-a:text-blue-200 hover:prose-a:text-blue-100' : 'prose-a:text-mamasaheli-primary hover:prose-a:text-mamasaheli-dark dark:prose-a:text-mamasaheli-light dark:hover:prose-a:text-blue-300'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Anchor }}>
                      {part.content}
                    </ReactMarkdown>
                  </div>
                ) : null}
                {part.type === 'image' && part.content ? (
                  <img
                    src={part.content}
                    alt={part.alt || 'User uploaded image'}
                    className="max-w-full h-auto max-h-60 object-contain rounded-md border border-gray-300 dark:border-gray-600 my-1 bg-gray-100 dark:bg-gray-600"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.alt = 'Image failed to load';
                      const errorDiv = document.createElement('div');
                      errorDiv.textContent = '[Image load error]';
                      errorDiv.className = 'text-xs text-red-500 italic p-2 bg-red-50 dark:bg-red-900/50 rounded';
                      target.parentNode?.replaceChild(errorDiv, target);
                    }} />
                ) : null}
              </div>
            ))}
            {message.role === 'model' && message.parts.some(p => p.type === 'text' && p.content?.trim()) && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost" size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity h-6 w-6 p-1 rounded-full bg-white/70 dark:bg-gray-600/70 hover:bg-white dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-500"
                    onClick={() => handleBookmarkClick(message.parts.find(p => p.type === 'text')?.content || '')}
                    aria-label="Bookmark this message"
                    disabled={isLoading}
                  >
                    <Bookmark className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top"><p>Bookmark</p></TooltipContent>
              </Tooltip>
            )}
          </div>
          {message.role === 'user' && (<User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0 self-start" aria-label="User Icon" />)}
        </div>
      );
    })}
    {error && !showPreChat && (
      <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/40 rounded-lg text-red-700 dark:text-red-300 text-sm shadow-sm my-2 mx-1">
        <Loader2 className="h-5 w-5 mr-2 flex-shrink-0" aria-hidden="true"/>
        <span className="flex-1 break-words">{error}</span>
        <Button variant="ghost" size="icon" onClick={() => setError(null)} className="h-6 w-6 p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/50 rounded-full -mr-1 ml-2 flex-shrink-0" aria-label="Dismiss error"><X className="h-4 w-4"/></Button>
      </div>
    )}
  </>
);

export default ChatMessages;
