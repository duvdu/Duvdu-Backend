import { Types } from 'mongoose';

export interface Iticket {
  id: string;
  userId: Types.ObjectId;
  name: string;
  phoneNumber: { key: string; number: string };
  message: string;
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}
