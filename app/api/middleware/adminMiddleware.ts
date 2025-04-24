import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';

export function isAdmin(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    const user = req.user; // `user` is now typed correctly
  
    if (user?.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied: Admins only' });
    }
  }