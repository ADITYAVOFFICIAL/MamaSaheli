import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Send, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getDoctorChatHistory, createDoctorChatMessage, UserProfile } from '@/lib/appwrite';
import { useToast } from '@/hooks/use-toast';
import { Models } from 'appwrite';

interface DoctorChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientProfile: UserProfile | null;
}

type ChatMessage = Models.Document & {
    userId: string;
    doctorId: string;
    sessionId: string;
    senderId: string;
    role: 'user' | 'doctor';
    content: string;
    timestamp: string;
    isRead: boolean;
};

const DoctorChatModal: React.FC<DoctorChatModalProps> = ({ isOpen, onClose, patientProfile }) => {
  const { user: doctorUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const patientId = patientProfile?.userId;
  const doctorId = doctorUser?.$id;

  const chatQueryKey = ['doctorChat', doctorId, patientId];

  const { data: messages = [], isLoading, isError, error } = useQuery<ChatMessage[], Error>({
    queryKey: chatQueryKey,
    queryFn: () => {
        if (!patientId || !doctorId) return Promise.resolve([]);
        return getDoctorChatHistory(patientId, doctorId) as Promise<ChatMessage[]>;
    },
    enabled: !!patientId && !!doctorId && isOpen, // Only fetch when the modal is open
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
        // A short delay allows the content to render before scrolling
        setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patientId || !doctorId) return;

    setIsSending(true);
    try {
      const sessionId = [patientId, doctorId].sort().join('_');
      await createDoctorChatMessage(
        patientId,
        doctorId,
        sessionId,
        doctorId, // The sender is the doctor
        'doctor',
        newMessage.trim()
      );
      setNewMessage('');
      // Invalidate the query to refetch messages immediately
      await queryClient.invalidateQueries({ queryKey: chatQueryKey });
    } catch (err) {
      toast({
        title: "Message Failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[90vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Chat with {patientProfile?.name || 'Patient'}</DialogTitle>
          <DialogDescription>
            This is a direct and secure line of communication.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/5 rounded-lg" />
                <Skeleton className="h-16 w-1/2 rounded-lg self-end ml-auto" />
                <Skeleton className="h-10 w-2/5 rounded-lg" />
              </div>
            ) : isError ? (
              <div className="text-center text-red-500 flex flex-col items-center justify-center h-full">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>Error loading chat history:</p>
                <p className="text-xs">{error.message}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 flex items-center justify-center h-full">
                <p>No messages yet. Start the conversation.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.$id}
                    className={`flex items-end gap-2 ${
                      msg.senderId === doctorId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-3 py-2 ${
                        msg.senderId === doctorId
                          ? 'bg-mamasaheli-primary text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p className={`text-xs mt-1 opacity-70 ${
                          msg.senderId === doctorId ? 'text-right' : 'text-left'
                      }`}>
                        {format(parseISO(msg.timestamp), 'p')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
              rows={1}
              className="flex-1 resize-none"
            />
            <Button onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DoctorChatModal;