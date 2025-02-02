import {
  BadRequestError,
  CopyrightContractStatus,
  MODELS,
  NotFound,
  ProjectContract,
  SuccessResponse,
  TeamContract,
  CopyrightContracts,
  RentalContracts,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';

export const acceptFilesController: RequestHandler<
  { contractId: string },
  SuccessResponse,
  {
    reference:
      | MODELS.projectContract
      | MODELS.teamContract
      | MODELS.copyrightContract
      | MODELS.rentalContract;
  }
> = async (req, res, next) => {
  let contract;

  if (req.body.reference === MODELS.projectContract)
    contract = await ProjectContract.findById(req.params.contractId);
  else if (req.body.reference === MODELS.teamContract)
    contract = await TeamContract.findById(req.params.contractId);
  else if (req.body.reference === MODELS.copyrightContract)
    contract = await CopyrightContracts.findById(req.params.contractId);
  else if (req.body.reference === MODELS.rentalContract)
    contract = await RentalContracts.findById(req.params.contractId);

  if (!contract)
    return next(new NotFound({ en: 'Contract not found', ar: 'العقد غير موجود' }, req.lang));

  if (contract.customer.toString() !== req.loggedUser.id)
    return next(
      new BadRequestError(
        { en: 'You are not the customer of this contract', ar: 'أنت لست عميلا لهذا العقد' },
        req.lang,
      ),
    );

  if (contract.status !== CopyrightContractStatus.ongoing)
    return next(
      new BadRequestError({ en: 'Contract is not ongoing', ar: 'العقد غير مفعل' }, req.lang),
    );

  contract.status = CopyrightContractStatus.completed;
  await contract.save();

  res.status(200).json({ message: 'success' });
};
