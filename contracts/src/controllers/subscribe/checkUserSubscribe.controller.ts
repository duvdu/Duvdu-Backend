import 'express-async-errors';
import { Contracts, NotFound, Setting, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const checkUserSubscribeController: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  unknown
> = async (req, res, next) => {
  // const user = await Users.findById(req.loggedUser.id);
  const user = await Users.findById(req.loggedUser.id);
  if (!user)
    return next(new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang));

  if (user.avaliableContracts > 0)
    return res.status(400).json(<any>{ data: { avaliableContracts: user.avaliableContracts } });

  const setting = await Setting.findOne();
  if (!setting)
    return next(new NotFound({ en: 'setting not found ', ar: 'الإعدادات غير موجودة' }, req.lang));

  const lastContracts = await Contracts.find({ sp: user._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('contract');

  // const highestPrice = Math.max(
  //   ...lastContracts.map((contract: any) => contract.contract.totalPrice || 0),
  // );
  const totalPrice = lastContracts.reduce((acc: number, contract: any) => acc + (contract.contract.totalPrice || 0), 0);
  const total = (totalPrice * setting.contractSubscriptionPercentage) / 100;
  return res.status(200).json(<any>{ message: 'success', data: { newFiveContractsPrice: total } });
};
