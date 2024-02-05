import multer from 'multer';
import { v4 } from 'uuid';

import { BadRequestError } from '../errors/bad-request-error';

interface uploadOptions {
  fileType?: string;
  maxSize?: number;
}

export const globalUploadMiddleware = (options?: uploadOptions) =>
  multer({
    storage: multer.memoryStorage(),
    fileFilter(req, file, callback) {
      if (!file.mimetype.startsWith(options?.fileType || 'image'))
        return callback(new BadRequestError('invalid file format'));
      if (file.size > (options?.maxSize || 2 * 1024 * 1024))
        return callback(new BadRequestError('invalid file size'));
      const splittedOriginalName = file.originalname.split('.').at(-1);
      file.filename = `${v4()}.${splittedOriginalName}`;
      callback(null, true);
    },
  });
