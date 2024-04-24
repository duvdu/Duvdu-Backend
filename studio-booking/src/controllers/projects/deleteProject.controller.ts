import 'express-async-errors';

import { NotAllowedError, studioBooking } from '@duvdu-v1/duvdu';

import { RemoveProjectHandler } from '../../types/endpoints/endpoints';

export const removeProjectHandler: RemoveProjectHandler = async (req, res, next) => {
  const project = await studioBooking.findOneAndUpdate(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
    },
    {
      isDeleted: true,
    },
    { new: true },
  );

  if (!project) return next(new NotAllowedError('user not owner for this project'));
  res.status(204).json({ message: 'success' });
};
