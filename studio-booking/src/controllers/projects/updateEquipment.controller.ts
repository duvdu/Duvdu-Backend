import { IstudioBooking, NotAllowedError, NotFound, studioBooking } from '@duvdu-v1/duvdu';

import { UpdateEquipmentHandler } from '../../types/endpoints/endpoints';

export const updateEquipmentHandler: UpdateEquipmentHandler = async (req, res, next) => {
  const { equipmentId, projectId } = req.params;
  const project = await studioBooking.findById(projectId);
  if (!project) return next(new NotFound('project not found'));
  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError('user not owner for this project'));
  const updatedProject = <IstudioBooking>await studioBooking.findOneAndUpdate(
    { _id: project, 'equipments._id': equipmentId },
    {
      $set: {
        'equipments.$.name': req.body.name,
        'equipments.$.fees': req.body.fees,
      },
    },
    { new: true },
  );
  res.status(200).json({ message: 'success', data: updatedProject });
};
