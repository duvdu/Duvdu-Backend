/* eslint-disable indent */
import { BadRequestError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

interface Ioptions {
  single?: string;
  array?: string;
  fields?: string[];
}

export const checkRequiredFields = (options: Ioptions) => <RequestHandler>((req, res, next) => {
    if (options.single) {
      if (!req.file || req.file.fieldname !== options.single)
        return next(new BadRequestError(`${options.single} is required`));
    } else if (options.array) {
      if (!req.files || !Array.isArray(req.files) || req.files[0].fieldname !== options.array)
        return next(new BadRequestError(`${options.array} is required`));
    } else if (options.fields) {
      if (!req.files) return next(new BadRequestError(`${options.fields.join(' ')} is required`));
      for (const field of options.fields) {
        if (!(req.files as any)?.[field]) return next(new BadRequestError(`${field} is required`));
      }
    }
    next();
  });
