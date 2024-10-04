import 'express-async-errors';

import {
  Bucket,
  NotAllowedError,
  NotFound,
  TeamContract,
  TeamContractStatus,
  TeamProject,
} from '@duvdu-v1/duvdu';

import { DeleteCreativeHandler } from '../../types/project.endpoints';

export const deleteCreativeHandler: DeleteCreativeHandler = async (req, res, next) => {
  const team = await TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } });
  if (!team) return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }));

  if (team.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const contract = await TeamContract.findOne({ sp: req.loggedUser.id, customer: req.body.user });

  if (!contract)
    return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang));

  if (
    !(
      contract.status != TeamContractStatus.pending &&
      contract.status != TeamContractStatus.rejected &&
      contract.status != TeamContractStatus.canceled
    )
  )
    return next(
      new NotAllowedError(
        {
          en: 'can not delete this creative invalid contract status',
          ar: 'لا يمكن حذف حالة العقد الإبداعي غير الصالح',
        },
        req.lang,
      ),
    );

  const index = team.creatives.findIndex(
    (creative) => creative.category.toString() === req.body.category,
  );

  if (index === -1)
    return next(
      new NotFound(
        { en: 'category not found in team', ar: 'الفئة غير موجودة في الفريق' },
        req.lang,
      ),
    );

  const userIndex = team.creatives[index].users.findIndex(
    (user) => user.user.toString() === req.body.user,
  );
  if (userIndex === -1)
    return next(
      new NotFound(
        { en: 'user not include in this category', ar: 'لم يتم تضمين المستخدم في هذه الفئة' },
        req.lang,
      ),
    );

  await new Bucket().removeBucketFiles(...team.creatives[index].users[userIndex].attachments);

  team.creatives[index].users.splice(userIndex, 1);

  await team.save();

  res.status(204).json({ message: 'success' });
};
