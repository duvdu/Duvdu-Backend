import { Types } from 'mongoose';

import { Iuser } from './User';

export interface Iproject {
  id: string;
  cover: string[];
  title: { en: string; ar: string };
  owner: Iuser | Types.ObjectId;
  creatives: (Iuser | Types.ObjectId)[];
}
