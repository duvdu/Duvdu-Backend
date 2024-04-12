import crypto from 'crypto';
import path from 'path';

import multer from 'multer';

import { BadRequestError } from '../errors/bad-request-error';
import { FOLDERS } from '../types/folders';

export const uploadProjectMedia = () =>
  multer({
    storage: multer.diskStorage({
      destination: path.join(__dirname, `../../../../../media/${FOLDERS.portfolio_post}`),
      filename(req, file, callback) {
        callback(
          null,
          `${Date.now()}_${crypto.randomBytes(6).toString('hex')}.${file.originalname.split('.').at(-1)}`,
        );
      },
    }),
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter(req, file, callback) {
      if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video'))
        return callback(null, true);
      return callback(new BadRequestError('invalid file format'));
    },
  }).fields([
    { name: 'cover', maxCount: 1 },
    { name: 'attachments', maxCount: 10 },
  ]);
