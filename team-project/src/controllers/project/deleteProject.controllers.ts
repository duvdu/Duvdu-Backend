import 'express-async-errors';

import { NotAllowedError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { DeleteProjectHandler } from '../../types/project.endpoints';

export const deleteProjectHandler: DeleteProjectHandler = async (req, res, next) => {
  const project = await TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } });

  if (!project) return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }));

  let userFound = false;
  project.creatives.forEach((creative) => {
    if (creative.users.length > 0) {
      userFound = true;
      return;
    }
  });

  if (userFound)
    return next(
      new NotAllowedError(
        {
          en: 'can not delete this team because have a creative',
          ar: 'لا يمكن حذف هذا الفريق لأنه يحتوي على مصمم إبداعي',
        },
        req.lang,
      ),
    );

  await TeamProject.findByIdAndDelete(req.params.teamId);
  res.status(204).json({ message: 'success' });
};
