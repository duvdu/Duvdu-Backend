import { RequestHandler } from 'express';

export const languageHeaderMiddleware: RequestHandler = async (req, res, next) => {
  const lang = req.headers['lang']?.toString() || '';
  (req as any).lang = ['ar', 'en'].includes(lang) ? lang : 'en';

  next();
};
