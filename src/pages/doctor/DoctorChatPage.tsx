import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  getUserProfile,
  UserProfile,
  createDoctorChatMessage,
  getDoctorChatHistory,
  deleteDoctorChatMessage,
  deleteDoctorChatHistory,
} from '@/lib/appwrite';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
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

interface ChatMessage {
  $id: string;
  content: string;
  senderId: string;
  role: 'user' | 'doctor';
  timestamp: string;
}

interface MessageProps {
  msg: ChatMessage;
  currentUserId: string;
  onDelete: (messageId: string) => void;
}

const MemoizedMessage: React.FC<MessageProps> = memo(({ msg, currentUserId, onDelete }) => {
  const isUserMessage = msg.senderId === currentUserId;

  return (
    <div className={`group flex items-center gap-2 ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
      {isUserMessage && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onDelete(msg.$id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      )}
      <div
        className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
          isUserMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p className="text-xs mt-1 opacity-75 text-right">
          {format(new Date(msg.timestamp), 'p')}
        </p>
      </div>
    </div>
  );
});

const DoctorChatPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | 'all' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = useCallback(async (): Promise<void> => {
    if (!user?.$id) return;
    setIsLoading(true);
    try {
      const userProfile = await getUserProfile(user.$id);
      if (userProfile?.assignedDoctorId) {
        const doctor = await getUserProfile(userProfile.assignedDoctorId);
        setDoctorProfile(doctor);
        const history = await getDoctorChatHistory(user.$id, userProfile.assignedDoctorId);
        const chatMessages: ChatMessage[] = history.map((doc: any) => ({
          $id: doc.$id,
          content: doc.content,
          senderId: doc.senderId,
          role: doc.role,
          timestamp: doc.timestamp,
        }));
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error("Failed to fetch chat data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || !user?.$id || !doctorProfile?.$id || isSending) return;

    setIsSending(true);
    const tempId = `temp_${Date.now()}`;
    const newMessage: ChatMessage = {
      $id: tempId,
      content: inputMessage,
      senderId: user.$id,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    try {
      const createdMessage = await createDoctorChatMessage(
        user.$id,
        doctorProfile.userId,
        `${user.$id}_${doctorProfile.userId}`,
        user.$id,
        'user',
        newMessage.content
      );
      setMessages((prev) =>
        prev.map((msg) => (msg.$id === tempId ? { ...createdMessage, $id: createdMessage.$id } : msg))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((msg) => msg.$id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRequest = (id: string | 'all'): void => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete || !user?.$id || !doctorProfile?.$id) return;

    setIsDeleting(true);
    const originalMessages = [...messages];

    try {
      if (itemToDelete === 'all') {
        setMessages([]);
        await deleteDoctorChatHistory(user.$id, doctorProfile.$id);
      } else {
        setMessages((prev) => prev.filter((msg) => msg.$id !== itemToDelete));
        await deleteDoctorChatMessage(itemToDelete);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
      setMessages(originalMessages);
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="h-[80vh] flex flex-col bg-white dark:bg-gray-900 shadow-lg rounded-lg">
          <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Chat with Dr. {doctorProfile?.name ?? 'your doctor'}
            </h2>
            {messages.length > 0 && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteRequest('all')}
                disabled={isDeleting}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </header>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <MemoizedMessage
                  key={msg.$id}
                  msg={msg}
                  currentUserId={user?.$id ?? ''}
                  onDelete={handleDeleteRequest}
                />
              ))
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-500 dark:text-gray-400">
                  No messages yet. Start the conversation!
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
          <footer className="p-4 border-t dark:border-gray-700 flex items-center space-x-4">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 resize-none bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500"
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending}
            />
            <Button onClick={() => void handleSendMessage()} disabled={isSending || !inputMessage.trim()}>
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </footer>
        </Card>
      </div>

      <AlertDialog open={itemToDelete !== null} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete === 'all'
                ? 'This action will permanently delete your entire chat history with this doctor. This cannot be undone.'
                : 'This action will permanently delete this message. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleConfirmDelete()} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default DoctorChatPage;