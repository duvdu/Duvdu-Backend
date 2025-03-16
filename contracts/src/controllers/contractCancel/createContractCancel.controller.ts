import {
  Channels,
  ContractCancel,
  Contracts,
  IContractCancel,
  NotFound,
  Roles,
  SuccessResponse,
  SystemRoles,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { sendNotification } from '../contractFiles/sendNotification';

export const createContractCancel: RequestHandler<
  unknown,
  SuccessResponse,
  Pick<IContractCancel, 'contract' | 'cancelReason'>
> = async (req, res) => {
  const contractCancelRequest = await ContractCancel.findOne({
    contract: req.body.contract,
    user: req.loggedUser.id,
  });

  if (contractCancelRequest)
    throw new NotFound(
      { en: 'contract canceled request already exists', ar: 'لقد قمت بالفعل بطلب إلغاء هذا العقد' },
      req.lang,
    );

  const contract = await Contracts.findById(req.body.contract);

  if (!contract) throw new NotFound({ en: 'contract not found', ar: 'العقد غير موجود' }, req.lang);

  await ContractCancel.create({
    contract: req.body.contract,
    cancelReason: req.body.cancelReason,
    user: req.loggedUser.id,
  });

  const role = await Roles.findOne({'key.en': SystemRoles.admin});

  const user = await Users.findOne({role: role?._id});

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request',
      'new contract cancel request',
      Channels.notification,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request',
      'new contract cancel request',
      Channels.notification,
    ),
    user && sendNotification(
      req.loggedUser.id.toString(),
      user.id.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request',
      'new contract cancel request',
      Channels.notification,
    ) 
  ]);

  return res.status(200).json({
    message: 'success',
  });
};
