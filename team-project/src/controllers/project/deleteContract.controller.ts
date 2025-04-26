import 'express-async-errors';

import {
  BadRequestError,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  SuccessResponse,
  TeamProject,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteContractHandler: RequestHandler<
  { teamId: string },
  SuccessResponse,
  { category: string; contract: string },
  unknown
> = async (req, res) => {
  const teamProject = await TeamProject.findById(req.params.teamId);
  if (!teamProject) throw new NotFound({ en: 'team not found', ar: 'التيم غير موجود' });

  const categoryIndex = teamProject.relatedContracts.findIndex(
    (el) => el.category.toString() == req.body.category,
  );
  if (categoryIndex == -1) throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' });

  const contractIndex = teamProject.relatedContracts[categoryIndex].contracts.findIndex(
    (el) => el.contract.toString() == req.body.contract,
  );
  if (contractIndex == -1) throw new NotFound({ en: 'contract not found', ar: 'العقد غير موجود' });

  const contract = await ProjectContract.findById(req.body.contract);
  if (!contract) throw new NotFound({ en: 'contract not found', ar: 'العقد غير موجود' });

  if (
    contract.status != ProjectContractStatus.pending &&
    contract.status != ProjectContractStatus.rejected &&
    contract.status != ProjectContractStatus.canceled
  )
    throw new BadRequestError({
      en: 'contract is not in pending or rejected or canceled status',
      ar: 'العقد ليس في حالة الانتظار أو مرفوض أو ملغي',
    });

  teamProject.relatedContracts[categoryIndex].contracts.splice(contractIndex, 1);

  await teamProject.save();

  res.status(204).json({ message: 'success' });
};
