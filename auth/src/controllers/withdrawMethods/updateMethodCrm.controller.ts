import {
  Channels,
  IWithdrawMethod,
  NotFound,
  SuccessResponse,
  Users,
  WithdrawMethodModel,
  WithdrawMethodStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from '../favourites/sendNotification';

export const updateMethodCrm: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IWithdrawMethod }>,
  { status: WithdrawMethodStatus }
> = async (req, res, next) => {
  const method = await WithdrawMethodModel.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!method)
    return next(
      new NotFound({ ar: 'طريقة السحب غير موجودة', en: 'Withdraw method not found' }, req.lang),
    );

  // send notification to user
  const user = await Users.findById(method.user);
  if (user) {
    await sendNotification(
      user.id,
      req.loggedUser.id,
      method.id,
      'withdrawMethod',
      'withdraw method status updated',
      req.body.status === WithdrawMethodStatus.ACTIVE
        ? 'your withdraw method is active now by duvdu admin'
        : 'your withdraw method is inactive now by duvdu admin',
      Channels.notification,
    );
  }
  res.status(200).json({ message: 'success', data: method });
};
