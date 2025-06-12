import { IWithdrawMethod, NotFound, SuccessResponse, WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateMethod: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IWithdrawMethod }>,
  unknown
> = async (req, res, next) => {
  const method = await WithdrawMethodModel.findByIdAndUpdate(
    req.params.id,
    { default: true },
    { new: true },
  );
  if (!method)
    return next(
      new NotFound({ ar: 'طريقة السحب غير موجودة', en: 'Withdraw method not found' }, req.lang),
    );

  if (method.default) {
    await WithdrawMethodModel.updateMany(
      { user: req.loggedUser.id, _id: { $ne: method._id } },
      { default: false },
    );
  }

  res.status(200).json({ message: 'success', data: method });
};
