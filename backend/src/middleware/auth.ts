import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Merchant } from '../models/merchant';

declare global {
  namespace Express {
    interface Request {
      merchant?: any;
    }
  }
}

export const authenticateMerchant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { merchantId: string };
    
    // Get merchant from database
    const merchant = await Merchant.findById(decoded.merchantId);
    if (!merchant) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add merchant to request object
    req.merchant = merchant;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    const merchant = await Merchant.findOne({ apiKey });
    if (!merchant) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
}; 