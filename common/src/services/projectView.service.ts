import { Document } from 'mongoose';

import { Users } from '../models/User.model';
import { Iuser } from '../types/User';

type UserDocument = Document & Iuser;

export const incrementProjectsView = async (userId: string) => {
  try {
    const user = await Users.findById(userId) as UserDocument;

    if (!user) {
      throw new Error('User not found');
    }

    user.projectsView += 1;
    await user.save();

    return user;
  } catch (error) {
    console.error('Error incrementing projectsView:', error);
    throw error;
  }
};
