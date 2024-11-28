import { Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';



export const subscribeUserController: RequestHandler = async (req, res) => {

  //   const setting = await Setting.findOne();
  //   if (!setting)
  //     return next(new NotFound({ en: 'setting not found ', ar: 'الإعدادات غير موجودة' }, req.lang));

  //   const lastContracts = await Contracts.find({ sp: req.loggedUser.id })
  //     .sort({ createdAt: -1 })
  //     .limit(5)
  //     .populate('contract');
  
  //   const highestPrice = Math.max(...lastContracts.map((contract:any) => contract.totalPrice || 0));

  await Users.findByIdAndUpdate(req.loggedUser.id, { $inc: { avaliableContracts: 5 } });

  return res.status(200).json(<any>{ message: 'success' });
};
