import { compareSync, hashSync } from 'bcryptjs';

import { env } from '../config/env';

export const hashPassword = (password: string) => {
  return hashSync(password + env.bcrypt.paper, env.bcrypt.salt);
};

export const comparePassword = (password: string, hash: string) => {
  return compareSync(password + env.bcrypt.paper, hash);
};
