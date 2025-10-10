import {
  BadRequestError,
  Contracts,
  CopyRights,
  NotFound,
  ProjectCycle,
  Rentals,
} from '@duvdu-v1/duvdu';
import { Users } from '@duvdu-v1/duvdu/build/models/User.model';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const deleteLoggedUser: RequestHandler = async (req, res) => {
  const user = await Users.findOne({ _id: req.loggedUser.id, isDeleted: false });

  if (!user) throw new NotFound({ ar: 'لا يوجد مستخدم', en: 'user not found' }, req.lang);

  const canDelete = await Contracts.findOne({
    $or: [
      { sp: req.loggedUser?.id, customer: user._id },
      { customer: req.loggedUser?.id, sp: user._id },
    ],
  }).populate({
    path: 'contract',
    match: {
      status: {
        $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'],
      },
    },
  });

  if (canDelete)
    throw new BadRequestError(
      {
        ar: 'لا يمكن حذف المستخدم لأنه لديه عقود',
        en: 'user cannot be deleted because he has contracts',
      },
      req.lang,
    );

  user.isDeleted = true;
  user.phoneNumber.number = `deleted_${user._id}_${Date.now()}`;
  user.email = `deleted_${user._id}_${Date.now()}@deleted.com`;
  user.appleId = null as any;
  user.googleId = null as any;
  user.refreshTokens = [];
  user.fcmTokens = [];
  await user.save();

  // delete all user's projects
  await CopyRights.updateMany({ user: user._id }, { isDeleted: true });
  await Rentals.updateMany({ user: user._id }, { isDeleted: true });
  await ProjectCycle.updateMany({ user: user._id }, { isDeleted: true });

  res.status(200).json({
    message: 'User deleted successfully',
  });
};
