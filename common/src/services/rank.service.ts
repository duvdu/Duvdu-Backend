import { Document } from 'mongoose';

import { Project } from '../models/allProjects.model';
import { Favourites } from '../models/favourites.model';
import { Rank } from '../models/ranks.model';
import { Iuser } from '../types/User';

export type UserDocument = Document & Iuser;

export const updateRankForUser = async (user: UserDocument) => {
  // get all user stats
  const projectsCount = await Project.countDocuments({ user: user._id });
  const favoriteCount = await Favourites.countDocuments({ user: user._id });
  const projectsLiked = user.likes;
  const acceptedProjectsCounter = user.acceptedProjectsCounter;

  // Find current rank that matches ALL criteria
  const currentRank = await Rank.findOne({
    actionCount: { $lte: acceptedProjectsCounter },
    favoriteCount: { $lte: favoriteCount },
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

  // Find next possible rank
  const nextRank = await Rank.findOne({
    $or: [
      { actionCount: { $gt: acceptedProjectsCounter } },
      { favoriteCount: { $gt: favoriteCount } },
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
          completed: favoriteCount - currentRank.favoriteCount,
          needed: nextRank.favoriteCount - currentRank.favoriteCount
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

  return user.save();
};
