import type { Request, Response, NextFunction } from 'express';

export function adminKeyGuard(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
