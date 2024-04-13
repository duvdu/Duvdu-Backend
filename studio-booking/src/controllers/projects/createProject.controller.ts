import { BadRequestError, Bucket, Categories, Files, FOLDERS, NotFound } from '@duvdu-v1/duvdu';

import { studioBooking } from '../../models/studio-booking.model';
import { CreateProjectHandler } from '../../types/endpoints/endpoints';




export const createProjectHandler:CreateProjectHandler = async (req,res,next)=>{
  console.log(true);
  
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover =  <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.findById(req.body.category);
  if (!category)
    return next(new NotFound(`category not found ${req.body.category}`));
  if (category.cycle != 2)
    return next(new BadRequestError('this category not related to this cycle'));

  const project = await studioBooking.create({...req.body}); 
  
  await new Bucket().saveBucketFiles(FOLDERS.studio_booking , ...attachments , ...cover);
  project.cover = `${FOLDERS.studio_booking}/${cover[0].filename}`;
  project.attachments = attachments.map((el) => `${FOLDERS.studio_booking}/${el.filename}`);
  await project.save();
  Files.removeFiles(...project.attachments , project.cover);

  res.status(201).json({message:'success' ,data:project});
};