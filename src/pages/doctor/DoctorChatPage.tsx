// src/pages/doctor/DoctorChatPage.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getUserProfile, UserProfile } from '@/lib/appwrite';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { createDoctorChatMessage, getDoctorChatHistory } from '@/lib/appwrite';
import { format } from 'date-fns';

interface ChatMessage {
  content: string;
  senderId: string;
  role: string;
  timestamp: string;
}

const DoctorChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const [doctorProfile, setDoctorProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = useCallback(async () => {
    if (!user?.$id) return;

    try {
      const userProfile = await getUserProfile(user.$id);
      if (userProfile?.assignedDoctorId) {
        const doctor = await getUserProfile(userProfile.assignedDoctorId);
        setDoctorProfile(doctor);
        const history = await getDoctorChatHistory(user.$id, userProfile.assignedDoctorId);
        const chatMessages: ChatMessage[] = history.map((doc: any) => ({
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
    fetchChatData();
  }, [fetchChatData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.$id || !doctorProfile?.$id) return;

    const newMessage = {
      content: inputMessage,
      senderId: user.$id,
      role: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    await createDoctorChatMessage(
      user.$id,
      doctorProfile.userId, // Assuming doctor's profile has their userId
      `${user.$id}_${doctorProfile.userId}`, // Simple session ID
      user.$id,
      'user',
      inputMessage
    );
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
        <Card className="h-[80vh] flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chat with Dr. {doctorProfile?.name || 'your doctor'}</h2>
          </div>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.senderId === user?.$id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.senderId === user?.$id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-75">{format(new Date(msg.timestamp), 'p')}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t flex items-center">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="mr-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DoctorChatPage;