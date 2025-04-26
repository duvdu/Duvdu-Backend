import 'express-async-errors';
import {
  BadRequestError,
  NotAllowedError,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  SuccessResponse,
  TeamProject,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteCategoryHandler: RequestHandler<
  { teamId: string; categoryId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res, next) => {
  const project = await TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } });
  if (!project)
    return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }, req.lang));

  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const categoryIndex = project.relatedContracts.findIndex(
    (el) => el.category.toString() === req.params.categoryId,
  );

  if (categoryIndex === -1)
    return next(
      new NotFound(
        { en: 'category not found in this team', ar: 'لم يتم العثور على الفئة في هذا الفريق' },
        req.lang,
      ),
    );

  const category = project.relatedContracts[categoryIndex];
  if (category.contracts.length > 0)
    return next(
      new BadRequestError(
        {
          en: 'can not delete this category because have users inside it',
          ar: 'لا يمكن حذف هذه الفئة لأن بها مستخدمين داخلها',
        },
        req.lang,
      ),
    );

  const contracts = await ProjectContract.find({
    _id: { $in: category.contracts.map((el) => el.contract) },
  });

  for (const contract of contracts)
    if (
      contract.status != ProjectContractStatus.pending &&
      contract.status != ProjectContractStatus.rejected &&
      contract.status != ProjectContractStatus.canceled
    ) {
      throw new BadRequestError({
        en: 'contract is not in pending or rejected or canceled status',
        ar: 'العقد ليس في حالة الانتظار أو مرفوض أو ملغي',
      });
    }

  project.relatedContracts.splice(categoryIndex, 1);
  await project.save();

  res.status(204).json({ message: 'success' });
};
