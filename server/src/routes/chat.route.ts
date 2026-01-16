import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { createChat, getUserChats, getSingleChat, deleteChat } from '../controllers/chat.controller';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.post('/chat', createChat);              // Create new chat
router.get('/chat', getUserChats);             // Get all user's chats
router.get('/chat/:chatId', getSingleChat);           // Get single chat with messages
router.delete('/chat/:chatId', deleteChat);     // Delete chat

export default router;