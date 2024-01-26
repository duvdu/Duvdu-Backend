import crypto from 'crypto';

export const hashVerificationCode = (verificationCode: string): string => {
  return crypto.createHash('sha256').update(verificationCode).digest('hex');
};
