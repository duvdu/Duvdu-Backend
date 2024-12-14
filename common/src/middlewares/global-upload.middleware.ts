import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

import { BadRequestError } from '../errors/bad-request-error';

interface UploadOptions {
  fileTypes?: string[];
  maxSize?: number;
  fileFilter?(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void;
}

const generateUniqueFileName = (originalname: string): string => {
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  const extension = originalname.split('.').pop();
  return `${timestamp}-${uuid}.${extension}`;
};

export const globalUploadMiddleware = (folder: string, options?: UploadOptions) => {
  const storage = multer.memoryStorage();

  // Extend memory storage to include filename generation
  const customStorage = Object.create(storage);
  customStorage._handleFile = function (req: any, file: Express.Multer.File, cb: any) {
    // Generate unique filename before storing
    file.filename = generateUniqueFileName(file.originalname);

    // Call original memory storage handler
    storage._handleFile(req, file, cb);
  };

  const upload = multer({
    storage: customStorage,
    limits: {
      fileSize: options?.maxSize || 3 * 1024 * 1024, // 3MB default
    },
    fileFilter: options?.fileFilter
      ? (options.fileFilter as any)
      : function fileFilter(req, file, callback) {
        if (!options?.fileTypes) {
          if (!file.mimetype.startsWith('image')) {
            return callback(
              new BadRequestError(
                {
                  en: 'Invalid file format',
                  ar: 'صيغة الملف غير صالحة',
                },
                'en',
              ),
            );
          }
          return callback(null, true);
        }

        const isValidType = options.fileTypes.some((type) => {
          const [category, subtype] = type.split('/');
          const [fileCategory, fileSubtype] = file.mimetype.split('/');
            
          return category === fileCategory && (subtype === '*' || subtype === fileSubtype);
        });

        if (isValidType) {
          return callback(null, true);
        } else {
          return callback(
            new BadRequestError(
              {
                en: 'Invalid file format',
                ar: 'صيغة الملف غير صالحة',
              },
              'en',
            ),
          );
        }
      },
  });

  return {
    single: upload.single.bind(upload),
    array: upload.array.bind(upload),
    fields: upload.fields.bind(upload),
    none: upload.none.bind(upload),
    any: upload.any.bind(upload),
  };
};
