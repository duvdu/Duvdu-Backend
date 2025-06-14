import 'express-async-errors';
import { ContractCancel , ContractStatus, Contracts, NotFound, SuccessResponse, MODELS, ProjectContractStatus, ProjectContract, RentalContractStatus, RentalContracts, CopyrightContractStatus, CopyrightContracts, ProducerContract, Channels, Roles, SystemRoles, Users  } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from '../contractFiles/sendNotification';


export const acceptContractCancel: RequestHandler<
  { contractCancelId: string },
  SuccessResponse,
  unknown
> = async (req, res) => {


  const contractCancel = await ContractCancel.findById(req.params.contractCancelId);

  if(!contractCancel) throw new NotFound({ar: 'الطلب غير موجود', en: 'Contract cancel not found'} , req.lang);

  const contract = await Contracts.findById(contractCancel.contract);

  if(!contract) throw new NotFound({ar: 'العقد غير موجود', en: 'Contract not found'} , req.lang);



  if (contract.ref === MODELS.projectContract) {
    await ProjectContract.findOneAndUpdate(contractCancel.contract, {status: ProjectContractStatus.canceled});
  }else if (contract.ref === MODELS.rentalContract) {
    await RentalContracts.findOneAndUpdate(contractCancel.contract, {status: RentalContractStatus.canceled});
  }else if (contract.ref === MODELS.copyrightContract) {
    await CopyrightContracts.findOneAndUpdate(contractCancel.contract, {status: CopyrightContractStatus.canceled});
  }else if (contract.ref === MODELS.producerContract) {
    await ProducerContract.findOneAndUpdate(contractCancel.contract, {status: ContractStatus.canceled});
  }else{
    throw new NotFound({ar: 'العقد غير موجود', en: 'Contract not found'} , req.lang);
  }

  const role = await Roles.findOne({'key.en': SystemRoles.admin});

  const user = await Users.findOne({role: role?._id});

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel success',
      'contract cancel success from duvdu team',
      Channels.notification,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel success',
      'contract cancel success from duvdu team',
      Channels.notification,
    ),
    user && sendNotification(
      req.loggedUser.id.toString(),
      user.id.toString(),
      contract._id.toString(),
      'contract',
      'contract cancel success',
      'contract cancel success from duvdu team',
      Channels.notification,
    ) 
  ]);


  res.status(200).json({
    message: 'success',
  });
};
