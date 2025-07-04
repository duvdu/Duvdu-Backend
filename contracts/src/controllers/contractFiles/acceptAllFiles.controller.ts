import {
  BadRequestError,
  Channels,
  CopyrightContracts,
  CYCLES,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  SubmitFilesStatus,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';

export const acceptAllFilesController: RequestHandler<
  { contractId: string },
  SuccessResponse,
  {
    cycle: CYCLES.copyRights | CYCLES.portfolioPost | CYCLES.teamProject;
  }
> = async (req, res) => {
  const { contractId } = req.params;
  const { cycle } = req.body;

  let contract;
  if (cycle === CYCLES.copyRights) {
    contract = await CopyrightContracts.findById(contractId);
  } else if (cycle === CYCLES.portfolioPost) {
    contract = await ProjectContract.findById(contractId);
  }

  if (!contract) throw new NotFound({ ar: 'العقد غير موجود', en: 'Contract not found' }, req.lang);

  if (contract.status !== ProjectContractStatus.ongoing) {
    throw new BadRequestError(
      { ar: 'لا يمكن تحديث الملفات لهذا العقد', en: 'Cannot update files for this contract' },
      req.lang,
    );
  }

  if (req.loggedUser.id !== contract.customer.toString())
    throw new BadRequestError(
      { ar: 'لا يمكن تحديث الملفات لهذا العقد', en: 'Cannot update files for this contract' },
      req.lang,
    );

  contract.submitFiles.forEach((file: any) => {
    if (file.status !== SubmitFilesStatus.approved && file.status !== SubmitFilesStatus.rejected) {
      file.status = SubmitFilesStatus.approved;
    }
  });

  contract.status = ProjectContractStatus.completed;

  await contract.save();

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'contract approved',
      'all files approved and the contract is completed',
      Channels.notification,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'contract approved',
      'all files approved and the contract is completed',
      Channels.notification,
    ),
  ]);

  res.status(200).json({ message: 'success' });
};
