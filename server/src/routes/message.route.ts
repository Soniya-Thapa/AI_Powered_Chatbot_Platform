import { Router } from 'express';
import { sendMessage, getMessages } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { sendMessageSchema, validate } from '../middlewares/validation.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat/:chatId', validate(sendMessageSchema), sendMessage); // send a message
router.get('/chat/:chatId', getMessages); // get messages

export default router;
