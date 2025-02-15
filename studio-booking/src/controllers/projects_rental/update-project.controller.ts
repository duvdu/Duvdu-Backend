import {
  Bucket,
  FOLDERS,
  NotAllowedError,
  SuccessResponse,
  Rentals,
  BadRequestError,
  RentalContracts,
  RentalContractStatus,
  filterTagsForCategory,
  CYCLES,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;

  // Find the existing project first to ensure it exists and belongs to the user
  const existingProject = await Rentals.findOne({
    _id: req.params.projectId,
    user: req.loggedUser.id,
  });

  if (!existingProject) return next(new NotAllowedError(undefined, req.lang));

  const bodyKeys = Object.keys(req.body);
  if (!(bodyKeys.length === 1 && bodyKeys[0] === 'showOnHome')) {
    const activeContract = await RentalContracts.findOne({
      project: existingProject._id,
      status: {
        $nin: [
          RentalContractStatus.rejected,
          RentalContractStatus.complaint,
          RentalContractStatus.canceled,
        ],
      },
    });

    if (activeContract)
      return next(
        new BadRequestError(
          {
            en: 'can not update project with has active contract',
            ar: 'لا يمكن تحديث المشروع الذي لديه عقد مفعل',
          },
          req.lang,
        ),
      );
  }

  if (req.body.category || req.body.subCategory || req.body.tags) {
    const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
      req.body.category.toString() || existingProject.category.toString(),
      req.body.subCategory || existingProject.subCategory,
      req.body.tags || existingProject.tags,
      CYCLES.studioBooking,
      req.lang,
    );
    req.body.tags = filteredTags;
    req.body.subCategory = { ...subCategoryTitle, _id: req.body.subCategory };
  }

  const s3 = new Bucket();

  // Upload new files if they exist
  if (attachments?.length || cover?.length) {
    await s3.saveBucketFiles(FOLDERS.studio_booking, ...(attachments || []), ...(cover || []));
  }

  // Prepare update data
  if (attachments) {
    req.body.attachments = attachments.map((file) => `${FOLDERS.studio_booking}/${file.filename}`);
  }

  if (cover) {
    req.body.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
  }

  // Update the project
  const project = await Rentals.findOneAndUpdate(
    { _id: req.params.projectId, user: req.loggedUser.id },
    req.body,
  );

  if (!project) {
    return next(new NotAllowedError(undefined, req.lang));
  }

  // Remove old files if they were replaced
  const removePromises: Promise<any>[] = [];

  if (attachments?.length) {
    removePromises.push(s3.removeBucketFiles(...project.attachments));
  }

  if (cover?.length) {
    removePromises.push(s3.removeBucketFiles(project.cover));
  }

  if (removePromises.length > 0) {
    await Promise.all(removePromises);
  }

  res.status(200).json({ message: 'success' });
};
