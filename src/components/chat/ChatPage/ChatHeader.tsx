import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, RefreshCw, Share2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface ChatHeaderProps {
  pregnancyTrimester: 1 | 2 | 3 | null;
  currentSessionId: string | null;
  getTrimesterBorderColor: () => string;
  handleClearChat: () => void;
  handleRestartChat: () => void;
  setShowPdfConfirm: (v: boolean) => void;
  isLoading: boolean;
  isStartingChat: boolean;
  isExportingPdf: boolean;
  messagesLength: number;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  pregnancyTrimester,
  currentSessionId,
  getTrimesterBorderColor,
  handleClearChat,
  handleRestartChat,
  setShowPdfConfirm,
  isLoading,
  isStartingChat,
  isExportingPdf,
  messagesLength
}) => (
  <div className={`p-2 px-3 sm:px-4 flex flex-row justify-between items-center border-b bg-white dark:bg-gray-800 dark:border-gray-700 shrink-0 rounded-t-lg ${getTrimesterBorderColor()}`}>
    <div className="flex flex-col">
      <span className="text-base sm:text-lg font-semibold text-mamasaheli-primary dark:text-mamasaheli-light">MamaSaheli Assistant</span>
      {pregnancyTrimester && (<span className="text-xs text-gray-500 dark:text-gray-400">Trimester {pregnancyTrimester} Context {currentSessionId ? `(Session ...${currentSessionId.slice(-4)})` : ''}</span>)}
      {!pregnancyTrimester && currentSessionId && (<span className="text-xs text-gray-500 dark:text-gray-400">Session ...{currentSessionId.slice(-4)}</span>)}
      {!currentSessionId && (<span className="text-xs text-gray-500 dark:text-gray-400">New Chat</span>)}
    </div>
    <div className="flex gap-1">
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleClearChat} disabled={isLoading || messagesLength === 0} className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full" aria-label="Clear chat view"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Clear Chat View</p></TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleRestartChat} disabled={isLoading || isStartingChat} className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full" aria-label="Start new chat"><RefreshCw className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>New Chat</p></TooltipContent></Tooltip>
      <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => setShowPdfConfirm(true)} disabled={isLoading || messagesLength === 0 || isExportingPdf} className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 rounded-full" aria-label="Export chat as PDF"><Share2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent><p>Export as PDF</p></TooltipContent></Tooltip>
    </div>
  </div>
);

export default ChatHeader;
