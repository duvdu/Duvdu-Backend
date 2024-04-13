import { NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { studioBooking, IstudioBooking } from '../../models/studio-booking.model';
import { AddEquipmentHandler } from '../../types/endpoints/endpoints';


export const addEquipmentHandler:AddEquipmentHandler = async(req,res,next)=>{
  const { projectId} = req.params;
  const project = await studioBooking.findById(projectId);
  if (!project) 
    return next(new NotFound('project not found'));
    //   if (project.user.toString() != req.loggedUser.id) 
    //     return next(new NotAllowedError('user not owner for this project'));
  const updatedProject = <IstudioBooking>await studioBooking.findOneAndUpdate(
    { _id: project },
    {
      $push: {
        equipments: {
          name: req.body.name,
          fees: req.body.fees
        }
      }
    },
    { new: true }
  );
  res.status(200).json({message:'success' , data:updatedProject});
};