// src/controllers/message.controller.ts
import { Request, Response } from 'express';
import prisma from '../prisma.client';
import { getAIResponse } from '../services/ai.service';


const MAX_MESSAGE_LENGTH = 2000;

// Send a message in a chat(user + AI response)
const sendMessage = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!chatId || !content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: 'chatId and content are required',
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      });
    }

    // Ensure chat belongs to the user
   const chat = await prisma.chat.findFirst({
  where: { id: chatId, userId },
  include: {
    messages: {
      orderBy: { createdAt: 'asc' },
      select: {
        sender: true,
        content: true,
      },
    },
  },
});


    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to send message in this chat',
      });
    }

    const userMessage = await prisma.message.create({
      data: {
        chatId,
        sender: 'user',
        content,
      },
      select: {
        id: true,
        chatId: true,
        sender: true,
        content: true,
        createdAt: true,
      },
    });
  // Build conversation history for AI context
    const conversationHistory = chat.messages.map((msg) => ({
      role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    }));

    // Get AI response
    const aiResponseContent = await getAIResponse(content.trim(), conversationHistory);

    // Save AI response
    const aiMessage = await prisma.message.create({
      data: {
        chatId,
        sender: 'ai',
        content: aiResponseContent,
      },
      select: {
        id: true,
        content: true,
        sender: true,
        createdAt: true,
      },
    });

     // Update chat's updatedAt timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage,
        aiMessage,
      },
    });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
};

// Get all messages of a chat
const getMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: 'chatId is required',
      });
    }

    // Ensure chat belongs to the user
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view messages of this chat',
      });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }, // oldest first
      select: {
        id: true,
        sender: true,
        content: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error in getMessages:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
};

export { 
  sendMessage, 
  getMessages 
};
