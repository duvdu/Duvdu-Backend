import { NotFound, SuccessResponse, WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteMethod: RequestHandler<{ id: string }, SuccessResponse, unknown> = async (
  req,
  res,
  next,
) => {
  const method = await WithdrawMethodModel.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true },
    { new: true },
  );
  if (!method)
    return next(
      new NotFound({ ar: 'طريقة السحب غير موجودة', en: 'Withdraw method not found' }, req.lang),
    );
  res.status(200).json({ message: 'success' });
};
