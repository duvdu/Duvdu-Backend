/* eslint-disable indent */
import { RequestHandler } from 'express';

import { BadRequestError } from '../errors/bad-request-error';

interface Ioptions {
  single?: string;
  array?: string;
  fields?: string[];
}

export const checkRequiredFields = (options: Ioptions) => <RequestHandler>((req, res, next) => {
    if (options.single) {
      if (!req.file || req.file.fieldname !== options.single)
        return next(new BadRequestError({en:`${options.single} is required` , ar:`${options.single} مطلوب`} , (req as any).lang));
    } else if (options.array) {
      if (!req.files || !Array.isArray(req.files) || req.files[0].fieldname !== options.array)
        return next(new BadRequestError({en:`${options.array} is required` , ar:`${options.array} مطلوب`} , (req as any).lang));
    } else if (options.fields) {
      if (!req.files) return next(new BadRequestError({en:`${options.fields.join(' ')} is required` , ar:`${options.fields.join(' ')} مطلوب`} , (req as any).lang));
      for (const field of options.fields) {
        if (!(req.files as any)?.[field]) return next(new BadRequestError({en:`${field} is required` , ar:`${field} مطلوب`}));
      }
    }
    next();
  });
