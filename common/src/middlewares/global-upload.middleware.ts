// /* eslint-disable indent */
// import path from 'path';

// import multer from 'multer';
// import { v4 } from 'uuid';

// import { BadRequestError } from '../errors/bad-request-error';

// interface uploadOptions {
//   fileTypes?: string[];
//   maxSize?: number;
//   fileFilter?(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void;
// }

// export const globalUploadMiddleware = (folder: string, options?: uploadOptions) =>
//   multer({
//     storage: multer.diskStorage({
//       destination: path.resolve(`media/${folder}`),
//       filename(req, file, callback) {
//         callback(null, `${v4()}.${file.originalname.split('.').at(-1)}`);
//       },
//     }),
//     limits: { fileSize: options?.maxSize || 3 * 1024 * 1024 }, // 3MB
//     fileFilter: options?.fileFilter
//       ? (options.fileFilter as any)
//       : function fileFilter(req, file, callback) {
//           if (!options?.fileTypes) {
//             if (!file.mimetype.startsWith('image'))
//               return callback(new BadRequestError('invalid file format'));
//             return callback(null, true);
//           }

//           if (options?.fileTypes?.some((type) => file.mimetype.startsWith(type)))
//             return callback(null, true);
//           else return callback(new BadRequestError('invalid file format'));
//         },
//   });


import multer from 'multer';

import { BadRequestError } from '../errors/bad-request-error';

interface UploadOptions {
  fileTypes?: string[];
  maxSize?: number;
  fileFilter?(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void;
}

export const globalUploadMiddleware = (folder: string, options?: UploadOptions) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: options?.maxSize || 3 * 1024 * 1024 }, // 3MB
    fileFilter: options?.fileFilter
      ? (options.fileFilter as any)
      : function fileFilter(req, file, callback) {
        if (!options?.fileTypes) {
          if (!file.mimetype.startsWith('image'))
            return callback(new BadRequestError('invalid file format'));
          return callback(null, true);
        }

        if (options?.fileTypes?.some((type) => file.mimetype.startsWith(type)))
          return callback(null, true);
        else return callback(new BadRequestError('invalid file format'));
      },
  });