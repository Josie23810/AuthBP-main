import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyAdmin = (req, res, next) => {
  const token = req.cookies.admin_access_token;

  if (!token) return next(errorHandler(401, 'Admin authentication required'));

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err || payload.role !== 'admin') {
      return next(errorHandler(403, 'Admin access denied'));
    }

    req.admin = payload;
    next();
  });
};
