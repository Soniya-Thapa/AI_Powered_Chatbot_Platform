import { Request, Response } from 'express';
import prisma from '../prisma.client';

// Create new chat
const createChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const chat = await prisma.chat.create({
      data: { userId },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: chat
    });
  } catch (error) {
    console.error('Error in createChat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create chat'
    });
  }
};

// Get user's chats
const getUserChats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const chats = await prisma.chat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            sender: true,
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      data: chats
    });
  } catch (error) {
    console.error('Error in getUserChats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chats'
    });
  }
};

// Get single chat with messages
const getSingleChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "chatId is required",
      });
    }
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            sender: true,
            createdAt: true,
          }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error in getChat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat'
    });
  }
};

// // Delete chat
const deleteChat = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "chatId is required",
      });
    }
    // Verify chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Delete chat (messages will be deleted automatically due to cascade)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return res.status(200).json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteChat:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete chat'
    });
  }
};

export {
  createChat,
  getUserChats,
  getSingleChat,
  deleteChat
}