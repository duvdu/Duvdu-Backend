/* eslint-disable no-constant-condition */
import { Document } from 'mongoose';

import { Rank } from '../models/ranks.model';
import { Users } from '../models/User.model';
import { Iuser } from '../types/User';

export type UserDocument = Document & Iuser;

export const updateRankForUser = async (userId: string) => {
  // get all user stats
  const user = await Users.findById(userId);
  if (!user) return;
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
    projectsCount: { $lte: projectsCount },
  })
    .sort({
      actionCount: -1,
      favoriteCount: -1,
      projectsLiked: -1,
      projectsCount: -1,
    })
    .exec();

  // Find next possible rank
  const nextRank = await Rank.findOne({
    actionCount: { $gt: acceptedProjectsCounter || 0 },
  })
    .sort({ actionCount: 1 })
    .exec();

  if (currentRank) {
    user.rank.title = currentRank.rank;
    user.rank.color = currentRank.color;

    if (nextRank) {
      const criteriaProgress = [
        {
          completed: acceptedProjectsCounter - currentRank.actionCount,
          needed: nextRank.actionCount - currentRank.actionCount,
        },
        {
          completed: projectsLiked - currentRank.projectsLiked,
          needed: nextRank.projectsLiked - currentRank.projectsLiked,
        },
        {
          completed: projectsCount - currentRank.projectsCount,
          needed: nextRank.projectsCount - currentRank.projectsCount,
        },
      ];

      // Improved progress calculation
      const progress = criteriaProgress
        .filter((c) => c.needed > 0)
        .map((c) => Math.min(Math.max((c.completed / c.needed) * 100, 0), 100)); // Ensure between 0-100

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

export const updateUsersAfterRankDeletion = async (deletedRankTitle: string) => {
  const BATCH_SIZE = 100;
  let processedCount = 0;

  try {
    // Find all users who have the deleted rank
    const totalUsersWithRank = await Users.countDocuments({
      'rank.title': deletedRankTitle,
    });

    if (totalUsersWithRank === 0) {
      console.log('No users found with the deleted rank:', deletedRankTitle);
      return;
    }

    console.log(`Found ${totalUsersWithRank} users with rank "${deletedRankTitle}" that need to be updated`);

    // Process users in batches
    while (true) {
      const users = await Users.find({ 'rank.title': deletedRankTitle })
        .skip(processedCount)
        .limit(BATCH_SIZE);

      if (users.length === 0) break;

      // Update rank for each user in the batch using the same logic as updateRankForUser
      await Promise.all(
        users.map(async (user) => {
          try {
            await updateRankForUser(user._id.toString());
          } catch (error) {
            console.error(`Failed to update rank for user ${user._id}:`, error);
          }
        }),
      );

      processedCount += users.length;
      console.log(`Updated ${processedCount}/${totalUsersWithRank} users`);
    }

    console.log(`Successfully updated all ${processedCount} users after rank deletion`);
  } catch (error) {
    console.error('Failed to update users after rank deletion:', error);
    throw error;
  }
};

export const recalculateAllUsersRanks = async () => {
  const BATCH_SIZE = 100;
  let processedCount = 0;

  try {
    // Process users in batches
    while (true) {
      const users = await Users.find({}).skip(processedCount).limit(BATCH_SIZE);

      if (users.length === 0) break;

      // Update rank for each user in the batch
      await Promise.all(
        users.map(async (user) => {
          try {
            const projectsCount = user.projectsCount;
            const projectsLiked = user.likes;
            const acceptedProjectsCounter = user.acceptedProjectsCounter;

            // Find current rank that matches ALL criteria
            const currentRank = await Rank.findOne({
              actionCount: { $lte: acceptedProjectsCounter },
              projectsLiked: { $lte: projectsLiked },
              projectsCount: { $lte: projectsCount },
            })
              .sort({
                actionCount: -1,
                favoriteCount: -1,
                projectsLiked: -1,
                projectsCount: -1,
              })
              .exec();

            // Find next possible rank
            const nextRank = await Rank.findOne({
              actionCount: { $gt: acceptedProjectsCounter || 0 },
            })
              .sort({ actionCount: 1 })
              .exec();

            if (currentRank) {
              user.rank.title = currentRank.rank;
              user.rank.color = currentRank.color;

              if (nextRank) {
                const criteriaProgress = [
                  {
                    completed: acceptedProjectsCounter - currentRank.actionCount,
                    needed: nextRank.actionCount - currentRank.actionCount,
                  },
                  {
                    completed: projectsLiked - currentRank.projectsLiked,
                    needed: nextRank.projectsLiked - currentRank.projectsLiked,
                  },
                  {
                    completed: projectsCount - currentRank.projectsCount,
                    needed: nextRank.projectsCount - currentRank.projectsCount,
                  },
                ];

                console.log('criteriaProgress', criteriaProgress);

                // Improved progress calculation
                const progress = criteriaProgress
                  .filter((c) => c.needed > 0)
                  .map((c) => Math.min(Math.max((c.completed / c.needed) * 100, 0), 100)); // Ensure between 0-100
                console.log('progress', progress);
                console.log('progress.length', progress.length ? Math.max(...progress) : 0);
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
          } catch (error) {
            console.error(`Failed to update rank for user ${user._id}:`, error);
          }
        }),
      );

      processedCount += users.length;
    }
  } catch (error) {
    console.error('Failed to recalculate user ranks:', error);
    throw error;
  }
};
