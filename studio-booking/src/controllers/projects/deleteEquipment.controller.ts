import 'express-async-errors';
import { NotFound, NotAllowedError, studioBooking } from '@duvdu-v1/duvdu';

import { DeleteEquipmentHandler } from '../../types/endpoints/endpoints';

export const deleteEquipmentHandler: DeleteEquipmentHandler = async (req, res, next) => {
  const { equipmentId, projectId } = req.params;
  const project = await studioBooking.findById(projectId);
  if (!project) return next(new NotFound('project not found'));
  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError('user not owner for this project'));
  await studioBooking.findOneAndUpdate(
    { _id: project },
    {
      $pull: {
        equipments: { _id: equipmentId },
      },
    },
    { new: true },
  );
  res.status(204).json({ message: 'success' });
};
