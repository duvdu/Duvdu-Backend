import { NotFound, Rank, Users } from '@duvdu-v1/duvdu';

export const updateRankForUser = async (userId: string, lang: string) => {
  const user = await Users.findById(userId);
  if (!user) throw new NotFound(undefined, lang);

  const currentRank = await Rank.findOne({ actionCount: { $lte: user.acceptedProjectsCounter } })
    .sort({ actionCount: -1 })
    .exec();

  const nextRank = await Rank.findOne({ actionCount: { $gt: user.acceptedProjectsCounter } })
    .sort({ actionCount: 1 })
    .exec();

  if (currentRank) {
    user.rank.title = currentRank.rank;
    user.rank.color = currentRank.color;
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
    user.rank.color = null;
  }

  await user.save();
};
