import { BadRequestError, Contracts, Irole, NotFound, SystemRoles } from '@duvdu-v1/duvdu';
import { Users } from '@duvdu-v1/duvdu/build/models/User.model';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const deleteUser: RequestHandler<{ userId: string }> = async (req, res) => {
  const user = await Users.findById(req.params.userId).populate('role');

  if (!user) throw new NotFound({ ar: 'لا يوجد مستخدم', en: 'user not found' }, req.lang);

  if (user.role && (user.role as Irole).key === SystemRoles.admin)
    throw new BadRequestError(
      {
        ar: 'لا يمكن حذف المستخدم المسؤول',
        en: 'admin user cannot be deleted',
      },
      req.lang,
    );

  if (user.isDeleted)
    throw new BadRequestError(
      {
        ar: 'المستخدم محذوف مسبقا',
        en: 'user is already deleted',
      },
      req.lang,
    );

  if (!user.isDeleted) {
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
  }

  user.isDeleted = true;
  user.refreshTokens = [];
  user.phoneNumber.number = `deleted_${user._id}_${Date.now()}`;
  user.email = `deleted_${user._id}_${Date.now()}@deleted.com`;
  user.appleId = null as any;
  user.googleId = null as any;
  user.fcmTokens = [];
  await user.save();

  res.status(200).json({
    message: 'User deleted successfully',
  });
};
