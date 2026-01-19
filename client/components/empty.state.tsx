import { MessageSquare, Plus } from 'lucide-react';

export function NoChatsEmpty({ onCreateChat }: { onCreateChat: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No conversations yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Start a new chat to begin talking with AI
      </p>
      <button
        onClick={onCreateChat}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-5 h-5" />
        New Chat
      </button>
    </div>
  );
}

export function NoMessagesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Start the conversation
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Type a message below to begin chatting with AI
      </p>
    </div>
  );
}