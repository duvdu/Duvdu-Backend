import 'express-async-errors';

import { BadRequestError, Bucket, Categories, Files, FOLDERS, NotAllowedError, NotFound, ProjectCycle } from '@duvdu-v1/duvdu';

import { UpdateProjectHandler } from '../../types/endoints';



export const updateProjectHandler:UpdateProjectHandler = async (req,res,next)=>{

  const project = await ProjectCycle.findOne({user:req.loggedUser.id , _id:req.params.projectId});
  if (!project) 
    return next(new NotAllowedError(undefined , req.lang));

  const category = await Categories.findById(project.category);
  if (!category) 
    return next(new NotFound({en:'category not found' , ar:'الفئة غير موجودة'} , req.lang));

  const media = category.media;

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.portfolio_post, ...attachments);
    req.body.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.portfolio_post, ...cover);
    req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    if (media === 'image' || media === 'audio') {
      if (!cover[0].mimetype.startsWith('image/')) {
        Files.removeFiles(...req.body.attachments, req.body.cover);
        return next(new BadRequestError({en:'Cover must be an image ' , ar:'يجب أن يكون الغلاف صورة'} ,req.lang));
      }
    } else if (media === 'video') {
      if (!cover[0].mimetype.startsWith('video/')) {
        Files.removeFiles(...req.body.attachments, req.body.cover);
        return next( new BadRequestError({en:'Cover must be a video for video media type' , ar:'يجب أن يكون الغلاف فيديو '} , req.lang));
      }
    } 
    Files.removeFiles(req.body.cover);
  }

  const updatedProject = await ProjectCycle.findOneAndUpdate({_id:req.params.projectId , user:req.loggedUser.id} , req.body , {new:true});
  if (!updatedProject) 
    return next(new BadRequestError({en:'failed to update project' , ar:'فشل في تحديث المشروع'} , req.lang));

  attachments && (await s3.removeBucketFiles(...project.attachments));
  cover && (await s3.removeBucketFiles(project.cover));

  res.status(200).json({message:'success' , data:updatedProject});
};