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

export const updateContractFileController: RequestHandler<
  { contractId: string; fileId: string },
  SuccessResponse,
  {
    reason: string;
    status: SubmitFilesStatus;
    cycle: CYCLES.copyRights | CYCLES.portfolioPost | CYCLES.teamProject;
  }
> = async (req, res) => {
  const { contractId, fileId } = req.params;
  const { reason, status, cycle } = req.body;

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

  const fileIndex = contract.submitFiles.findIndex(
    (file: any) => file._id.toString() === fileId.toString(),
  );

  if (fileIndex === -1)
    throw new NotFound({ ar: 'الملف غير موجود', en: 'File not found' }, req.lang);

  if (
    contract.submitFiles[fileIndex].status === SubmitFilesStatus.approved ||
    contract.submitFiles[fileIndex].status === SubmitFilesStatus.rejected
  )
    throw new BadRequestError(
      { ar: 'لا يمكن تحديث الملفات المعتمدة', en: 'Cannot update approved files' },
      req.lang,
    );

  if (status) contract.submitFiles[fileIndex].status = status;

  if (reason) contract.submitFiles[fileIndex].reason = reason;

  let notificationMessage = '';
  let notificationTitle = '';

  if (status === SubmitFilesStatus.approved) {
    notificationTitle = 'file approved';
    notificationMessage = 'file has been approved and the contract is completed';
  } else if (status === SubmitFilesStatus.rejected) {
    notificationTitle = 'file rejected';
    notificationMessage = 'file has been rejected';
  } else {
    notificationTitle = 'file updated';
    notificationMessage = 'file has been updated';
  }

  await contract.save();

  await Promise.all([
    sendNotification(
      contract.sp.toString(),
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      notificationTitle,
      notificationMessage,
      Channels.notification,
    ),
    sendNotification(
      contract.customer.toString(),
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      notificationTitle,
      notificationMessage,
      Channels.notification,
    ),
  ]);

  res.status(200).json({ message: 'success' });
};
