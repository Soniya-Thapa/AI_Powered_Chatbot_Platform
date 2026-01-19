'use client';

import { Bot, User } from 'lucide-react';
import MarkdownMessage from './markdown.message';
import CopyButton from './copy.button';

interface MessageProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp?: string;
}

export default function Message({ content, sender, timestamp }: MessageProps) {
  const isUser = sender === 'user';

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div
      className={`flex gap-4 p-4 ${
        isUser 
          ? 'bg-transparent' 
          : 'bg-gray-50 dark:bg-gray-800/50'
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? 'bg-blue-600'
              : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}
        >
          {isUser ? (
            <User className="w-5 h-5 text-white" />
          ) : (
            <Bot className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTime(timestamp)}
            </span>
          )}
        </div>
        
        {/* Conditional Rendering: Markdown for AI, Plain Text for User */}
        {sender === 'ai' ? (
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <MarkdownMessage content={content} />
            </div>
            <CopyButton text={content} />
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
              {content}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}