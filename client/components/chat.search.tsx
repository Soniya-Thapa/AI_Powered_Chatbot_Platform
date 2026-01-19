'use client';

import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { searchChats, clearSearch } from '@/lib/redux/slices/chat.slice';

export default function ChatSearch() {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const { searchQuery } = useAppSelector((state) => state.chat);

  // Debounce search to avoid too many updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(searchChats(query));
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(timeoutId);
  }, [query, dispatch]);

  const handleClear = () => {
    setQuery('');
    dispatch(clearSearch());
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search conversations..."
        className="w-full pl-10 pr-10 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
}