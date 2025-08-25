import React, { useState, useEffect, useMemo, useRef, memo } from 'react';
import { useAuthStore } from '@/store/authStore';
import {
  client,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ID } from 'appwrite';
import type { Models } from 'appwrite';

interface ChatMessage extends Models.Document {
  content: string;
  senderId: string;
  role: 'user' | 'doctor';
  timestamp: string;
  userId: string;
  doctorId: string;
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
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | 'all' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userId = user?.$id;

  const { data: doctorProfile, isLoading: isLoadingDoctor } = useQuery<UserProfile | null, Error>({
    queryKey: ['assignedDoctorProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const userProfile = await getUserProfile(userId);
      if (!userProfile?.assignedDoctorId) return null;
      return await getUserProfile(userProfile.assignedDoctorId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
  });

  const doctorProfileId = doctorProfile?.$id ?? null;
  const doctorUserId = doctorProfile?.userId ?? doctorProfile?.$id ?? null;
  const chatQueryKey = useMemo(() => ['doctorChat', userId, doctorUserId], [userId, doctorUserId]);

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<ChatMessage[], Error>({
    queryKey: chatQueryKey,
    queryFn: async () => {
      if (!userId || !doctorUserId) return [];
      const history = await getDoctorChatHistory(userId, doctorUserId);
      return (history as ChatMessage[]) ?? [];
    },
    enabled: !!userId && !!doctorUserId,
  });

  useEffect(() => {
    if (!userId || !doctorUserId) return;

    const databaseId = import.meta.env.VITE_APPWRITE_BLOG_DATABASE_ID;
    const collectionId = import.meta.env.VITE_APPWRITE_DRCHAT_KEY;
    const channel = `databases.${databaseId}.collections.${collectionId}.documents`;

    const unsubscribe = client.subscribe(channel, (response: any) => {
      const payload = response.payload ?? {};
      const events: string[] = (response.events ?? response.events) || [];

      const payloadUserId = payload.userId ?? payload.senderId ?? payload.sender ?? null;
      const payloadDoctorId = payload.doctorId ?? payload.toDoctorId ?? payload.doctor ?? null;

      const isRelevant =
        (payloadUserId === userId && (payloadDoctorId === doctorUserId || payloadDoctorId === doctorProfileId)) ||
        (payloadUserId === doctorUserId && (payloadDoctorId === userId || payloadDoctorId === userId));

      if (!isRelevant) return;

      const event = (events[0] ?? '').toLowerCase();

      if (event.includes('create') || event.includes('update') || event.includes('upsert')) {
        queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) => {
          const exists = oldData.some((m) => m.$id === payload.$id);
          if (exists) {
            return oldData.map((m) => (m.$id === payload.$id ? (payload as ChatMessage) : m));
          }
          return [...oldData, (payload as ChatMessage)];
        });
        return;
      }

      if (event.includes('delete')) {
        queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) =>
          oldData.filter((msg) => msg.$id !== payload.$id)
        );
        return;
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch {
          // ignore
        }
        return;
      }
      if (unsubscribe && typeof (unsubscribe as any).close === 'function') {
        try {
          (unsubscribe as any).close();
        } catch {
          // ignore
        }
      }
    };
  }, [userId, doctorUserId, doctorProfileId, queryClient, chatQueryKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputMessage.trim() || !userId || !doctorUserId) return;

    setIsSending(true);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    const tempId = ID.unique();
    const optimisticMessage: ChatMessage = {
      $id: tempId,
      content: messageContent,
      senderId: userId,
      role: 'user',
      timestamp: new Date().toISOString(),
      userId: userId,
      doctorId: doctorUserId,
      $collectionId: '',
      $databaseId: '',
      $createdAt: '',
      $updatedAt: '',
      $permissions: [],
      $sequence: 0, // Added to satisfy ChatMessage type
    };

    queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) => [...oldData, optimisticMessage]);

    try {
      const realMessage = await createDoctorChatMessage(
        userId,
        doctorUserId,
        `${userId}_${doctorUserId}`,
        userId,
        'user',
        messageContent
      );

      queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) =>
        oldData.map((msg) => (msg.$id === tempId ? (realMessage as ChatMessage) : msg))
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) => oldData.filter((msg) => msg.$id !== tempId));
      setInputMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteRequest = (id: string | 'all'): void => {
    setItemToDelete(id);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!itemToDelete || !userId || (!doctorProfileId && !doctorUserId)) return;

    setIsDeleting(true);
    try {
      if (itemToDelete === 'all') {
        await deleteDoctorChatHistory(userId, doctorProfileId ?? doctorUserId ?? '');
        queryClient.setQueryData(chatQueryKey, () => []);
      } else {
        await deleteDoctorChatMessage(itemToDelete);
        queryClient.setQueryData(chatQueryKey, (oldData: ChatMessage[] = []) =>
          oldData.filter((msg) => msg.$id !== itemToDelete)
        );
      }
    } catch (error) {
      console.error('Failed to delete:', error);
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

  const isLoading = isLoadingDoctor || isLoadingMessages;

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
