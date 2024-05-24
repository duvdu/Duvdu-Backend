import fs from 'fs';
import path from 'path';

import { RequestHandler } from 'express';
import { validationResult, matchedData } from 'express-validator';

import { ValidationError } from '../errors/validation-error';


const loadLanguageFile = (lang:string) => {
  console.log(lang);
  
  try {
    const filePath = path.join(__dirname, `../languages/${lang}.json`);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading language file for ${lang}:`, error);
    // Default to English if there's an error loading the requested language
    const defaultPath = path.join(__dirname, '../languages/en.json');
    const data = fs.readFileSync(defaultPath, 'utf8');    
    return JSON.parse(data);
  }
};

export const globalValidatorMiddleware: RequestHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const lang = (req as any).lang;
    const language = loadLanguageFile(lang);
    const translatedErrors = errors.array().map(error => ({
      ...error,
      msg: language[error.msg] || error.msg
    }));
    return next(new ValidationError(translatedErrors));
  }
  req.body = matchedData(req, { locations: ['body'] });
  req.params = matchedData(req, { locations: ['params'] });
  req.query = matchedData(req, { locations: ['query'] });
  next();
};
