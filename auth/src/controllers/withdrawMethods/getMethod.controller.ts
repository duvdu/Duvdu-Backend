import { IWithdrawMethod, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getMethod: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IWithdrawMethod }>,
  unknown
> = async (req, res, next) => {
  const method = await WithdrawMethodModel.findById(req.params.id);
  if (!method)
    return next(
      new NotFound({ ar: 'طريقة السحب غير موجودة', en: 'Withdraw method not found' }, req.lang),
    );
  res.status(200).json({ message: 'success', data: method });
};
