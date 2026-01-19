import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API functions
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  verifyCode: (data: { email: string; code: string }) =>
    api.post('/auth/verify-code', data),
  
  resendCode: (data: { email: string }) =>
    api.post('/auth/resend-code', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () =>
    api.post('/auth/logout'),
};

export const chatAPI = {
  getChats: () =>
    api.get('/chats/chat'),
  
  createChat: () =>
    api.post('/chats/chat'),
  
  getChat: (chatId: string) =>
    api.get(`/chats/chat/${chatId}`),
  
  deleteChat: (chatId: string) =>
    api.delete(`/chats/chat/${chatId}`),
};

export const messageAPI = {
  getMessages: (chatId: string) =>
    api.get(`/messages/chat/${chatId}`),
  
  sendMessage: (chatId: string, content: string) =>
    api.post(`/messages/chat/${chatId}`, { content }),
};

export default api;