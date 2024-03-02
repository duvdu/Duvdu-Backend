import { Types } from 'mongoose';

import { Iuser } from './User';

export interface Iticket {
  id: string;
  userId: Types.ObjectId | Iuser;
  name: string;
  phoneNumber: { key: string; number: string };
  message: string;
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}
