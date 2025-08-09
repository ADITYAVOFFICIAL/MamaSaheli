import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ImagePlus, Mic, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (v: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSendMessage: () => void;
  handleImageAttachClick: () => void;
  handleVoiceInput: () => void;
  isLoading: boolean;
  isRecording: boolean;
  pendingImageFile: File | null;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputMessage,
  setInputMessage,
  handleKeyDown,
  handleSendMessage,
  handleImageAttachClick,
  handleVoiceInput,
  isLoading,
  isRecording,
  pendingImageFile
}) => (
  <div className="flex items-center gap-2">
    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleImageAttachClick} disabled={isLoading || !!pendingImageFile || isRecording} className="text-gray-500 hover:text-mamasaheli-primary dark:text-gray-400 dark:hover:text-mamasaheli-light h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0" aria-label="Attach image"><ImagePlus className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>Attach Image</p></TooltipContent></Tooltip>
    <Input
      value={inputMessage}
      onChange={(e) => setInputMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={ isRecording ? "Listening... Click mic to stop" : pendingImageFile ? "Add comment (optional) and send..." : "Type your message or question..." }
      disabled={isLoading || isRecording}
      className="flex-1 h-9 sm:h-10 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 focus:ring-mamasaheli-primary/50"
      aria-label="Chat message input"
      maxLength={2000}
    />
    <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleVoiceInput} disabled={isLoading || !!pendingImageFile} className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0 text-gray-500 hover:text-mamasaheli-primary dark:text-gray-400 dark:hover:text-mamasaheli-light ${ isRecording ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 animate-pulse' : '' }`} aria-label={isRecording ? "Stop voice recording" : "Start voice input"}><Mic className="h-5 w-5" /></Button></TooltipTrigger><TooltipContent><p>{isRecording ? "Stop Recording" : "Voice Input"}</p></TooltipContent></Tooltip>
    <Tooltip><TooltipTrigger asChild><Button onClick={handleSendMessage} disabled={isLoading || isRecording || (!inputMessage.trim() && !pendingImageFile)} className="bg-mamasaheli-primary hover:bg-mamasaheli-dark dark:bg-mamasaheli-primary dark:hover:bg-mamasaheli-dark h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0 rounded-full transition-colors" aria-label="Send message">{isLoading ? (<Loader2 className="h-5 w-5 animate-spin" />) : (<Send className="h-5 w-5" />)}</Button></TooltipTrigger><TooltipContent><p>Send</p></TooltipContent></Tooltip>
  </div>
);

export default ChatInput;
