import { BadRequestError, Contracts, NotFound } from '@duvdu-v1/duvdu';
import { Users } from '@duvdu-v1/duvdu/build/models/User.model';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const deleteLoggedUser: RequestHandler = async (req, res) => {
  const user = await Users.findById(req.loggedUser.id);

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
  user.phoneNumber.number = null as any;
  user.email = null as any;
  await user.save();

  res.status(200).json({
    message: 'User deleted successfully',
  });
};
