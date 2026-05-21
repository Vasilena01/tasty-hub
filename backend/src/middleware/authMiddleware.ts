import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Multer file type
interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

// Custom request type with authenticated user data and file upload support
export interface AuthRequest extends Omit<Request, 'file'> {
  user?: {
    id: number;
    username: string;
  };
  file?: MulterFile;
}

interface JwtPayload {
  id: number;
  username: string;
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    if ((error as any).name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired'
      });
      return;
    }
    if ((error as any).name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
      return;
    }
    res.status(401).json({
      success: false,
      error: 'Token verification failed'
    });
  }
};

export { verifyToken };
