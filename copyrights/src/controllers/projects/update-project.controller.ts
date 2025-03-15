import {
  SuccessResponse,
  NotFound,
  NotAllowedError,
  CopyRights,
  IcopyRights,
  filterTagsForCategory,
  CYCLES,
  CopyrightContracts,
  CopyrightContractStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IcopyRights }>,
  Partial<
    Pick<
      IcopyRights,
      | 'price'
      | 'duration'
      | 'address'
      | 'showOnHome'
      | 'searchKeywords'
      | 'isDeleted'
      | 'location'
      | 'category'
    > & { tags?: string[]; subCategory?: string }
  >
> = async (req, res, next) => {
  const project = await CopyRights.findOne({ _id: req.params.projectId, isDeleted: { $ne: true } });
  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));

  if (project.user.toString() !== req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  // check if the project is editable or not with the contract status
  if (Object.keys(req.body).some((key) => key !== 'showOnHome' && key !== 'isDeleted')) {
    const contract = await CopyrightContracts.findOne({
      project: req.params.projectId,
    }).sort({ createdAt: -1 });

    const nonEditableStatuses = [
      CopyrightContractStatus.rejected,
      CopyrightContractStatus.completed,
      CopyrightContractStatus.canceled,
    ];

    if (contract && nonEditableStatuses.includes(contract.status))
      return next(
        new NotAllowedError(
          { en: 'project is not editable', ar: 'المشروع غير قابل للتعديل' },
          req.lang,
        ),
      );
  }

  if (req.body.category || req.body.subCategory || req.body.tags) {
    const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
      req.body.category?.toString() || project.category.toString(),
      req.body.subCategory?.toString() || project.subCategory.toString(),
      req.body.tags || project.tags.map((tag: any) => tag._id.toString()),
      CYCLES.copyRights,
      req.lang,
    );
    (req.body.subCategory as any) = { ...subCategoryTitle, _id: req.body.subCategory };
    (req.body.tags as any) = filteredTags;
  }

  const newProject = <IcopyRights>await CopyRights.findByIdAndUpdate(
    req.params.projectId,
    req.body,
    {
      new: true,
    },
  );

  res.status(200).json({ message: 'success', data: newProject });
};
