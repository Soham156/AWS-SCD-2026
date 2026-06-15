import type { Request, Response, NextFunction } from 'express';

export function scannerKeyGuard(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-scanner-key'];
  if (!key || key !== process.env.SCANNER_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}
