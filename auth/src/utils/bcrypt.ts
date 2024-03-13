import { compare, hash } from 'bcryptjs';

import { env } from '../config/env';

export const hashPassword = async (password: string) =>
  await hash(password + env.bcrypt.paper, env.bcrypt.salt);

export const comparePassword = async (password: string, hash: string) =>
  await compare(password + env.bcrypt.paper, hash);
