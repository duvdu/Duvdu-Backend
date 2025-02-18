/* eslint-disable no-constant-condition */
import { Document } from 'mongoose';

import { Rank } from '../models/ranks.model';
import { Users } from '../models/User.model';
import { Iuser } from '../types/User';

export type UserDocument = Document & Iuser;

export const updateRankForUser = async (user: UserDocument) => {
  // get all user stats
  const projectsCount = user.projectsCount;
  const projectsLiked = user.likes;
  const acceptedProjectsCounter = user.acceptedProjectsCounter;

  console.log('acceptedProjectsCounter', acceptedProjectsCounter);
  console.log('projectsLiked', projectsLiked);
  console.log('projectsCount', projectsCount);
  // Find current rank that matches ALL criteria
  const currentRank = await Rank.findOne({
    actionCount: { $lte: acceptedProjectsCounter },
    projectsLiked: { $lte: projectsLiked },
    projectsCount: { $lte: projectsCount }
  })
    .sort({ 
      actionCount: -1,
      favoriteCount: -1,
      projectsLiked: -1,
      projectsCount: -1 
    })
    .exec();

  console.log('currentRank', currentRank);

  // Find next possible rank
  const nextRank = await Rank.findOne({
    $or: [
      { actionCount: { $gt: acceptedProjectsCounter } },
      { projectsLiked: { $gt: projectsLiked } },
      { projectsCount: { $gt: projectsCount } }
    ]
  })
    .sort({ 
      actionCount: 1,
      favoriteCount: 1,
      projectsLiked: 1,
      projectsCount: 1 
    })
    .exec();

  console.log('nextRank', nextRank);

  if (currentRank) {
    user.rank.title = currentRank.rank;
    user.rank.color = currentRank.color;

    if (nextRank) {
      // Calculate progress based on the most relevant criterion
      const criteriaProgress = [
        {
          completed: acceptedProjectsCounter - currentRank.actionCount,
          needed: nextRank.actionCount - currentRank.actionCount
        },
        {
          completed: projectsLiked - currentRank.projectsLiked,
          needed: nextRank.projectsLiked - currentRank.projectsLiked
        },
        {
          completed: projectsCount - currentRank.projectsCount,
          needed: nextRank.projectsCount - currentRank.projectsCount
        }
      ];

      // Find the criterion with the highest progress percentage
      const progress = criteriaProgress
        .filter(c => c.needed > 0)
        .map(c => (c.completed / c.needed) * 100);
      
      user.rank.nextRangPercentage = progress.length ? Math.max(...progress) : 0;
      user.rank.nextRankTitle = nextRank.rank;
    } else {
      user.rank.nextRangPercentage = 100;
    }
  } else {
    user.rank.title = null;
    user.rank.nextRangPercentage = 0;
    user.rank.nextRankTitle = null;
    user.rank.color = null;
  }

  await user.save();
  return user;
};

export const recalculateAllUsersRanks = async () => {
  const BATCH_SIZE = 100;
  let processedCount = 0;
  
  try {
    // Process users in batches
    while (true) {
      const users = await Users.find({})
        .skip(processedCount)
        .limit(BATCH_SIZE)
        .lean();

      if (users.length === 0) break;

      // Update rank for each user in the batch
      await Promise.all(
        users.map(async user => {
          try {
            await updateRankForUser(user as UserDocument);
          } catch (error) {
            console.error(`Failed to update rank for user ${user._id}:`, error);
          }
        })
      );

      processedCount += users.length;
    }
  } catch (error) {
    console.error('Failed to recalculate user ranks:', error);
    throw error;
  }
};