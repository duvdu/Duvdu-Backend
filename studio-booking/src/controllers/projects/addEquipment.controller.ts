import 'express-async-errors';
import { IstudioBooking, NotAllowedError, NotFound, studioBooking } from '@duvdu-v1/duvdu';

import { AddEquipmentHandler } from '../../types/endpoints/endpoints';

export const addEquipmentHandler: AddEquipmentHandler = async (req, res, next) => {
  const { projectId } = req.params;
  const project = await studioBooking.findById(projectId);
  if (!project) return next(new NotFound({en:'project not found' , ar:'المشروع غير موجود'} , req.lang));
  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined , req.lang));
  const updatedProject = <IstudioBooking>await studioBooking.findOneAndUpdate(
    { _id: project },
    {
      $push: {
        equipments: {
          name: req.body.name,
          fees: req.body.fees,
        },
      },
    },
    { new: true },
  );
  res.status(200).json({ message: 'success', data: updatedProject });
};
