import crypto from 'crypto';

export const generateCode = (length: number = 3) =>
  new Promise<string>((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer.toString('hex'));
      }
    });
  });
