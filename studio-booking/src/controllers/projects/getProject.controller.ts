import { NotFound, studioBooking } from '@duvdu-v1/duvdu';

import { GetProjectHandler } from '../../types/endpoints/endpoints';

export const getProjectHandler: GetProjectHandler = async (req, res, next) => {
  const project = await studioBooking
    .findOne({
      _id: req.params.projectId,
      isDeleted: { $ne: true },
    })
    .populate([{ path: 'user', select: ['username', 'profileImage', 'isOnline'] }]);

  if (!project) return next(new NotFound('project not found'));
  res.status(200).json({ message: 'success', data: project });
};
