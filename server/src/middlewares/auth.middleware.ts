import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../env-config/config';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
      return;
    }

   const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;
      
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token missing'
      });
      return;
    }

    // Verify token (using your single JWT_SECRET)
    const decoded = jwt.verify(token,envConfig.jwtSecretKey!) as { userId: string; email: string };

    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
export{
  authMiddleware
}