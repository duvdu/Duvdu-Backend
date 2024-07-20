import { Document } from 'mongoose';

import { Rank } from '../models/ranks.model';
import { Iuser } from '../types/User';

export type UserDocument = Document & Iuser;


export const updateRankForUser = async (user: UserDocument) => {
  const currentRank = await Rank.findOne({ actionCount: { $lte: user.acceptedProjectsCounter } }).sort({ actionCount: -1 }).exec();
  const nextRank = await Rank.findOne({ actionCount: { $gt: user.acceptedProjectsCounter } }).sort({ actionCount: 1 }).exec();

  if (currentRank) {
    user.rank.title = currentRank.rank;

    if (nextRank) {
      const actionsNeeded = nextRank.actionCount - currentRank.actionCount;
      const actionsCompleted = user.acceptedProjectsCounter - currentRank.actionCount;
      user.rank.nextRangPercentage = (actionsCompleted / actionsNeeded) * 100;
      user.rank.nextRankTitle = nextRank.rank;
    } else {
      user.rank.nextRangPercentage = 100;
    }

  } else {
    user.rank.title = null;
    user.rank.nextRangPercentage = 0; 
    user.rank.nextRankTitle = null;
  }

  return user.save();
};
