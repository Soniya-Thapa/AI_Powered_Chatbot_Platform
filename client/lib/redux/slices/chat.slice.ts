import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatAPI, messageAPI } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  createdAt: string;
}

interface Chat {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface ChatState {
  chats: Chat[];
  filteredChats: Chat[]; // ✅ Added for search
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  searchQuery: string; // ✅ Added to track search query
}

const initialState: ChatState = {
  chats: [],
  filteredChats: [], // ✅ Initialize empty
  currentChat: null,
  messages: [],
  loading: false,
  sendingMessage: false,
  error: null,
  searchQuery: '', // ✅ Initialize empty
};

// Async thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getChats();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chats');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.createChat();
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await messageAPI.getMessages(chatId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content }: { chatId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await messageAPI.sendMessage(chatId, content);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chatId: string, { rejectWithValue }) => {
    try {
      await chatAPI.deleteChat(chatId);
      return chatId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete chat');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    // ✅ Search functionality
    searchChats: (state, action: PayloadAction<string>) => {
      const query = action.payload.toLowerCase().trim();
      state.searchQuery = query;
      
      if (query === '') {
        // If search is empty, show all chats
        state.filteredChats = state.chats;
      } else {
        // Filter chats that have messages containing the query
        state.filteredChats = state.chats.filter(chat =>
          chat.messages?.some(msg => 
            msg.content.toLowerCase().includes(query)
          )
        );
      }
    },
    // ✅ Clear search
    clearSearch: (state) => {
      state.searchQuery = '';
      state.filteredChats = state.chats;
    },
  },
  extraReducers: (builder) => {
    // Fetch chats
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
        // ✅ Update filtered chats when chats are fetched
        state.filteredChats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create chat
    builder
      .addCase(createChat.pending, (state) => {
        state.loading = true;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.loading = false;
        state.chats.unshift(action.payload);
        state.currentChat = action.payload;
        // ✅ Update filtered chats
        if (state.searchQuery === '') {
          state.filteredChats.unshift(action.payload);
        }
      })
      .addCase(createChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        // Add both user and AI messages
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.aiMessage);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload as string;
      });

    // Delete chat
    builder
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter(chat => chat.id !== action.payload);
        // ✅ Update filtered chats
        state.filteredChats = state.filteredChats.filter(chat => chat.id !== action.payload);
        if (state.currentChat?.id === action.payload) {
          state.currentChat = null;
          state.messages = [];
        }
      });
  },
});

export const { setCurrentChat, clearCurrentChat, clearError, searchChats, clearSearch } = chatSlice.actions;
export default chatSlice.reducer;