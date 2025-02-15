import 'express-async-errors';
import {
  BadRequestError,
  CopyrightContracts,
  CYCLES,
  NotFound,
  ProjectContract,
  SuccessResponse,
  TeamContract,
  ProjectContractStatus,
  SubmitFilesStatus,
  Channels,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';

export const addContractFileController: RequestHandler<
  { contractId: string },
  SuccessResponse,
  {
    link: string;
    cycle: CYCLES.copyRights | CYCLES.portfolioPost | CYCLES.teamProject;
    notes: string;
  }
> = async (req, res) => {
  const { contractId } = req.params;
  const { link, cycle, notes } = req.body;

  let contract;

  if (cycle === CYCLES.copyRights) {
    contract = await CopyrightContracts.findById(contractId);
  } else if (cycle === CYCLES.portfolioPost) {
    contract = await ProjectContract.findById(contractId);
  } else if (cycle === CYCLES.teamProject) {
    contract = await TeamContract.findById(contractId);
  }

  if (!contract) throw new NotFound({ ar: 'العقد غير موجود', en: 'Contract not found' }, req.lang);

  if (contract.status !== ProjectContractStatus.ongoing)
    throw new BadRequestError({ ar: 'العقد غير موجود', en: 'invalid contract status' }, req.lang);

  if (req.loggedUser.id !== contract.sp.toString())
    throw new BadRequestError(
      { ar: 'لا يمكن إضافة ملفات إلى هذا العقد', en: 'Cannot add files to this contract' },
      req.lang,
    );

  // // Check if all existing files are rejected before adding new one
  // if (contract.submitFiles.length > 0) {
  //   const allFilesRejected = contract.submitFiles.every(
  //     (file) => file.status === SubmitFilesStatus.rejected,
  //   );
  //   if (!allFilesRejected) {
  //     throw new BadRequestError(
  //       {
  //         ar: 'لا يمكن إضافة ملف جديد حتى يتم رفض جميع الملفات السابقة',
  //         en: 'Cannot add new file until all previous files are rejected',
  //       },
  //       req.lang,
  //     );
  //   }
  // }

  contract.submitFiles.push({
    link,
    status: SubmitFilesStatus.pending,
    notes,
    dateOfSubmission: new Date(),
  });
  await contract.save();

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'new file submitted from provider',
      'new file submitted from provider',
      Channels.update_contract,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'new file submitted from provider',
      'new file submitted from provider',
      Channels.update_contract,
    ),
  ]);

  res.status(200).json({ message: 'success' });
};
