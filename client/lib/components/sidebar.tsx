'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { 
  fetchChats, 
  createChat, 
  deleteChat, 
  setCurrentChat,
  clearCurrentChat 
} from '@/lib/redux/slices/chat.slice';
import { logout } from '@/lib/redux/slices/auth.slice';
import { 
  MessageSquarePlus, 
  MessageSquare, 
  Trash2, 
  LogOut, 
  User,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  onChatSelect?: () => void;
}

export default function Sidebar({ onChatSelect }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { chats, currentChat, loading } = useAppSelector((state) => state.chat);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleNewChat = async () => {
    const result = await dispatch(createChat());
    if (createChat.fulfilled.match(result)) {
      setIsOpen(false);
      onChatSelect?.();
    }
  };

  const handleSelectChat = (chat: any) => {
    dispatch(setCurrentChat(chat));
    setIsOpen(false);
    onChatSelect?.();
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      setDeletingId(chatId);
      await dispatch(deleteChat(chatId));
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCurrentChat());
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header with New Chat Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            <MessageSquarePlus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && chats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat)}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-colors
                  ${
                    currentChat?.id === chat.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {chat.messages && chat.messages.length > 0
                        ? chat.messages[0].content.slice(0, 30) + '...'
                        : 'New conversation'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    disabled={deletingId === chat.id}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-2 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}