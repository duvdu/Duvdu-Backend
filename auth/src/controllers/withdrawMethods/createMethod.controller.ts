import { WithdrawMethodModel, IWithdrawMethod, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createMethod: RequestHandler<
  unknown,
  SuccessResponse,
  Pick<IWithdrawMethod, 'method' | 'name' | 'number' | 'default' | 'iban'>
> = async (req, res) => {
  const method = await WithdrawMethodModel.create({
    ...req.body,
    user: req.loggedUser.id,
  });

  // if the method is default, make all other methods default false
  if (req.body.default)
    await WithdrawMethodModel.updateMany(
      { user: req.loggedUser.id, _id: { $ne: method._id } },
      { default: false },
    );

  res.status(201).json({ message: 'success' });
};
