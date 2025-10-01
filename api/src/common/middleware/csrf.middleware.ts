import { Request, Response, NextFunction } from 'express';

const CSRF_EXCLUDE_PATHS = ['/auth/login', '/auth/csrf']; // puedes agregar más

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (CSRF_EXCLUDE_PATHS.includes(req.path)) {
    return next(); // No aplica CSRF para login ni para csrf token endpoint
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const cookies = req.cookies || {};
    const csrfTokenHeader = req.get('X-CSRF-Token');
    const csrfTokenCookie = cookies['csrf_token'];
    if (!csrfTokenHeader || csrfTokenHeader !== csrfTokenCookie) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  }
  next();
}
