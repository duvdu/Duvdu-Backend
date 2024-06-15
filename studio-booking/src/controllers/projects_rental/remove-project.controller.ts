import { NotAllowedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Rentals } from '../../models/rental.model';

export const removeProjectHandler: RequestHandler = async (req, res, next) => {
  const project = await Rentals.updateOne(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
    },
    {
      isDeleted: true,
    },
  );

  if (project.modifiedCount < 1) return next(new NotAllowedError(undefined, req.lang));
  res.status(204).json({ message: 'success' });
};
