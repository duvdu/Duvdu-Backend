import { NotFound, SuccessResponse, WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteMethod: RequestHandler<{ id: string }, SuccessResponse, unknown> = async (
  req,
  res,
  next,
) => {
  const method = await WithdrawMethodModel.findById(req.params.id);
  if (!method)
    return next(
      new NotFound({ ar: 'طريقة السحب غير موجودة', en: 'Withdraw method not found' }, req.lang),
    );

  // If the method being deleted is default, find another method to set as default
  if (method.default) {
    const anotherMethod = await WithdrawMethodModel.findOne({
      user: method.user,
      _id: { $ne: method._id },
      isDeleted: false,
    });
    if (anotherMethod) {
      await WithdrawMethodModel.findByIdAndUpdate(anotherMethod._id, { default: true });
    }
  }

  // Update the method to be deleted
  await WithdrawMethodModel.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
    default: false,
  });

  res.status(200).json({ message: 'success' });
};
