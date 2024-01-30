import { Types } from 'mongoose';

export interface IsavedProject {
  user: Types.ObjectId;
  title: string;
  projects: [Types.ObjectId];
}
