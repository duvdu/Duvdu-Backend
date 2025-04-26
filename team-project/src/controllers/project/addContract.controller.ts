import 'express-async-errors';

import {
  NotFound,
  TeamProject,
  SuccessResponse,
  ProjectContract,
  Categories,
  BadRequestError,
  CYCLES,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const addContractHandler: RequestHandler<
  { teamId: string },
  SuccessResponse,
  { category: string; contract: string },
  unknown
> = async (req, res) => {
  const teamProject = await TeamProject.findById(req.params.teamId);
  if (!teamProject) throw new NotFound({ en: 'team not found', ar: 'التيم غير موجود' });

  const contract = await ProjectContract.findById(req.body.contract);
  if (!contract) throw new NotFound({ en: 'contract not found', ar: 'العقد غير موجود' });

  const category = await Categories.findById(req.body.category);
  if (!category) throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' });

  if (category.cycle != CYCLES.portfolioPost)
    throw new BadRequestError({
      en: 'category is not related to project cycle',
      ar: 'الفئة غير موجودة',
    });

  const categoryIndex = teamProject.relatedContracts.findIndex(
    (el) => el.category.toString() == category.toString(),
  );

  if (categoryIndex == -1) {
    teamProject.relatedContracts.push({
      category: category._id,
      contracts: [{ contract: contract._id }],
    });
  } else {
    teamProject.relatedContracts[categoryIndex].contracts.push({ contract: contract._id });
  }

  await teamProject.save();

  res.status(204).json({ message: 'success' });
};
