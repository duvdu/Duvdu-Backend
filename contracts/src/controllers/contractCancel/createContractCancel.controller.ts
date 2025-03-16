import {
  ContractCancel,
  Contracts,
  IContractCancel,
  NotFound,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

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

  return res.status(200).json({
    message: 'success',
  });
};
