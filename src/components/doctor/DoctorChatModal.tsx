import React, { useState, useEffect, useRef, memo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Send, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import {
  client,
  getDoctorChatHistory,
  createDoctorChatMessage,
  deleteDoctorChatMessage,
  deleteDoctorChatHistory,
  UserProfile,
} from '@/lib/appwrite';
import { useToast } from '@/hooks/use-toast';
import { Models } from 'appwrite';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface ChatMessageBubbleProps {
  msg: ChatMessage;
  doctorId?: string;
  onDelete: (messageId: string) => void;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = memo(({ msg, doctorId, onDelete }) => {
  const isDoctorMessage = msg.senderId === doctorId;
  return (
    <div
      className={`group flex items-end gap-2 ${
        isDoctorMessage ? 'justify-end' : 'justify-start'
      }`}
    >
      {isDoctorMessage && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(msg.$id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 ${
          isDoctorMessage
            ? 'bg-mamasaheli-primary text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
        }`}
      >
        <p className="text-sm break-words">{msg.content}</p>
        <p className={`text-xs mt-1 opacity-70 ${
            isDoctorMessage ? 'text-right' : 'text-left'
        }`}>
          {format(parseISO(msg.timestamp), 'p')}
        </p>
      </div>
    </div>
  );
});

const DoctorChatModal: React.FC<DoctorChatModalProps> = ({ isOpen, onClose, patientProfile }) => {
  const { user: doctorUser } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | 'all' | null>(null);

  const patientId = patientProfile?.userId;
  const doctorId = doctorUser?.$id;

  const chatQueryKey = ['doctorChat', doctorId, patientId];

  const { data: messages = [], isLoading, isError, error } = useQuery<ChatMessage[], Error>({
    queryKey: chatQueryKey,
    queryFn: () => {
        if (!patientId || !doctorId) return Promise.resolve([]);
        return getDoctorChatHistory(patientId, doctorId) as Promise<ChatMessage[]>;
    },
    enabled: !!patientId && !!doctorId && isOpen,
  });

  useEffect(() => {
    if (!isOpen || !patientId || !doctorId) return;

    const databaseId = import.meta.env.VITE_APPWRITE_BLOG_DATABASE_ID;
    const collectionId = import.meta.env.VITE_APPWRITE_DRCHAT_KEY;
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;

    const unsubscribe = client.subscribe(channel, (response) => {
      const event = response.events[0];
      const payload = response.payload as ChatMessage;

      const isRelevantMessage = payload.userId === patientId && payload.doctorId === doctorId;
      if (!isRelevantMessage) return;

      if (event.includes('create')) {
        queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) => [...oldData, payload]);
      }

      if (event.includes('delete')) {
        queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) =>
          oldData.filter((msg) => msg.$id !== payload.$id)
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen, patientId, doctorId, queryClient, chatQueryKey]);

  useEffect(() => {
    if (isOpen) {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !patientId || !doctorId) return;

    setIsSending(true);
    setNewMessage('');
    try {
      const sessionId = [patientId, doctorId].sort().join('_');
      await createDoctorChatMessage(
        patientId,
        doctorId,
        sessionId,
        doctorId,
        'doctor',
        newMessage.trim()
      );
    } catch (err) {
      setNewMessage(newMessage);
      toast({
        title: "Message Failed",
        description: "Could not send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRequest = (id: string | 'all') => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !patientId || !doctorId) return;

    setIsDeleting(true);
    try {
      if (itemToDelete === 'all') {
        await deleteDoctorChatHistory(patientId, doctorId);
        toast({ title: "Chat History Deleted", description: "The entire chat history has been cleared." });
      } else {
        await deleteDoctorChatMessage(itemToDelete);
        toast({ title: "Message Deleted", description: "The message has been removed." });
      }
    } catch (err) {
      toast({
        title: "Deletion Failed",
        description: "Could not complete the deletion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[90vw] h-[85vh] flex flex-col p-0 sm:rounded-none rounded-2xl lg:rounded-xl">
         <DialogHeader className="p-4 border-b flex flex-row justify-between items-center text-left">
  <div>
    <DialogTitle>Chat with {patientProfile?.name || 'Patient'}</DialogTitle>
    <DialogDescription>
      This is a direct and secure line of communication.
    </DialogDescription>
  </div>
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
                    <ChatMessageBubble
                      key={msg.$id}
                      msg={msg}
                      doctorId={doctorId}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Add Delete Chat History Button Below Messages */}
          {messages.length > 0 && (
            <div className="flex justify-end px-4 py-2 border-t bg-gray-50 dark:bg-gray-800/50">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteRequest('all')}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Chat History
              </Button>
            </div>
          )}

          <div className="p-4 border-t bg-gray-50 dark:bg-gray-800/50 rounded-2xl lg:rounded-xl">
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

      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete === 'all'
                ? 'This action will permanently delete the entire chat history with this patient. This cannot be undone.'
                : 'This action will permanently delete this message. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DoctorChatModal;