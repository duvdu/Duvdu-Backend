import { Types } from 'mongoose';

export interface Ireport {
  sourceUser: Types.ObjectId;
  targetUser: Types.ObjectId;
  project: Types.ObjectId;
  desc: string;
  attachments: [string];
  state: { isClosed: boolean; closedBy: Types.ObjectId; feedback: string };
}
