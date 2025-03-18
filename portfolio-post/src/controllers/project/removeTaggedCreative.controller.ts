import 'express-async-errors';
import { NotFound, ProjectCycle, SuccessResponse, UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const removeTaggedCreative: RequestHandler<
  { projectId: string; creativeId: string },
  SuccessResponse
> = async (req, res) => {
  const project = await ProjectCycle.findOne({ _id: req.params.projectId, isDeleted: false });

  if (!project) throw new NotFound({ ar: 'المشروع غير موجود', en: 'Project not found' }, req.lang);

  const creativeIndex = project.creatives.findIndex(
    (creativeData: any) => creativeData.creative.toString() === req.params.creativeId.toString(),
  );

  if (creativeIndex === -1)
    throw new NotFound({ ar: 'المستخدم غير موجود', en: 'User not found' }, req.lang);

  if (
    !(
      req.loggedUser.id === project.user.toString() ||
      req.loggedUser.id === project.creatives[creativeIndex].creative.toString()
    )
  )
    throw new UnauthorizedError(
      {
        ar: 'ليس لديك صلاحية لتنفيذ هذا العملية',
        en: 'You do not have permission to perform this operation',
      },
      req.lang,
    );

  project.creatives.splice(creativeIndex, 1);

  await project.save();

  return res.status(200).json({ message: 'success' });
};
