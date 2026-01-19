'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { loadUserFromStorage } from '@/lib/redux/slices/auth.slice';
import {
  fetchMessages,
  sendMessage,
  createChat
} from '@/lib/redux/slices/chat.slice';
import Sidebar from '@/components/sidebar';
import Message from '@/components/message';
import { Send, Loader2, Bot } from 'lucide-react';
import { MessageSkeleton, TypingIndicator } from '@/components/skeletons';
import toast from 'react-hot-toast'; // ✅ Add at top

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentChat, messages, sendingMessage, loading } = useAppSelector((state) => state.chat);

  // Check authentication
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Fetch messages when chat changes
  useEffect(() => {
    if (currentChat?.id) {
      dispatch(fetchMessages(currentChat.id));
    }
  }, [currentChat?.id, dispatch]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sendingMessage) return;

    let chatId = currentChat?.id;

    // Create a new chat if none exists
    if (!chatId) {
      const result = await dispatch(createChat());
      if (createChat.fulfilled.match(result)) {
        chatId = result.payload.id;
      } else {
        toast.error('Failed to create chat'); // ✅ Error
        return;
      }
    }

    const messageContent = inputMessage;
    setInputMessage('');

    const result = await dispatch(sendMessage({
      chatId: chatId!,
      content: messageContent
    }));

    // ✅ Show error if message failed
    if (sendMessage.rejected.match(result)) {
      toast.error('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            // ✅ Show skeleton while loading messages
            <div className="max-w-4xl mx-auto w-full">
              <MessageSkeleton />
            </div>
          ) : messages.length === 0 ? (
            // Empty state
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to AI Chat
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Start a conversation by typing a message below. I'm here to help with
                questions, creative tasks, coding, and more!
              </p>
            </div>
          ) : (
            // Messages
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  content={message.content}
                  sender={message.sender}
                  timestamp={message.createdAt}
                />
              ))}

              {/* ✅ Typing indicator when AI is responding */}
              {sendingMessage && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto w-full p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Shift + Enter for new line)"
                  rows={1}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none max-h-40"
                  disabled={sendingMessage}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || sendingMessage}
                className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingMessage ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              AI can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}