import 'express-async-errors';
import {
  BadRequestError,
  NotFound,
  RentalContracts,
  RentalContractStatus,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const qrCodeVerificationController: RequestHandler<
  { contractId: string },
  SuccessResponse
> = async (req, res) => {
  const contract = await RentalContracts.findById(req.params.contractId);

  if (!contract)
    throw new NotFound({ en: 'Contract not found', ar: 'لم يتم العثور على العقد' }, req.lang);

  if (contract.customer.toString() !== req.loggedUser.id.toString())
    throw new BadRequestError(
      {
        en: 'You are not allowed to verify this contract',
        ar: 'أنت غير مسموح بالتحقق من هذا العقد',
      },
      req.lang,
    );

  if (contract.status !== RentalContractStatus.ongoing)
    throw new BadRequestError({ en: 'Contract is not ongoing', ar: 'العقد غير مفعل' }, req.lang);

  if (contract.qrCodeVerification)
    throw new BadRequestError({ en: 'Contract is already verified', ar: 'العقد مفعل' }, req.lang);

  contract.qrCodeVerification = true;
  await contract.save();

  return res.status(200).json({ message: 'success' });
};
