import 'express-async-errors';

import {
  NotAllowedError,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  SuccessResponse,
  TeamProject,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteProjectHandler: RequestHandler<
  { teamId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res, next) => {
  const project = await TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } });

  if (!project) return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }));

  let activeContract = false;
  project.relatedContracts.forEach((contract) => {
    contract.contracts.forEach(async (cont) => {
      const contract = await ProjectContract.findById(cont);
      if (
        contract?.status != ProjectContractStatus.canceled &&
        contract?.status != ProjectContractStatus.rejected &&
        contract?.status != ProjectContractStatus.pending
      ) {
        activeContract = true;
      }
    });
    if (activeContract)
      throw new NotAllowedError({ en: 'team has active contract', ar: 'التيم لديه عقد فعال' });
  });

  await TeamProject.findByIdAndDelete(req.params.teamId);
  res.status(204).json({ message: 'success' });
};
