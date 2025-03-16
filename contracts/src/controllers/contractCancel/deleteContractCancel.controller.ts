import { Channels, ContractCancel, SuccessResponse, Roles, SystemRoles, Users, NotFound, Contracts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { sendNotification } from '../contractFiles/sendNotification';

export const deleteContractCancel: RequestHandler<
  { contractCancelId: string },
  SuccessResponse
> = async (req, res) => {
  const contractCancel = await ContractCancel.findByIdAndDelete(req.params.contractCancelId);

  if(!contractCancel) throw new NotFound({ar: 'الطلب غير موجود', en: 'Contract cancel not found'} , req.lang);

  const contract = await Contracts.findById(contractCancel.contract);

  if(!contract) throw new NotFound({ar: 'العقد غير موجود', en: 'Contract not found'} , req.lang);


  const role = await Roles.findOne({'key.en': SystemRoles.admin});

  const user = await Users.findOne({role: role?._id});

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request rejected',
      'contract cancel request rejected by duvdu team',
      Channels.notification,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request rejected',
      'contract cancel request rejected by duvdu team',
      Channels.notification,
    ),
    user && sendNotification(
      req.loggedUser.id.toString(),
      user.id.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel request rejected',
      'contract cancel request rejected by duvdu team',
      Channels.notification,
    ) 
  ]);

  return res.status(200).json({
    message: 'success',
  });
};
