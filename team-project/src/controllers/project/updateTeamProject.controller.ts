import 'express-async-errors';

import { Bucket, Files, FOLDERS, IteamProject, NotAllowedError, NotFound, TeamProject } from '@duvdu-v1/duvdu';

import { UpdateProjectHandler } from '../../types/endpoints';



export const updateProjectHandler:UpdateProjectHandler = async (req,res,next)=>{
  const attachments = <Express.Multer.File[] | undefined>(req.files as any).attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any).cover;

  const project = await TeamProject.findById(req.params.projectId);
  if (!project) 
    return next(new NotFound('project not found'));
  if (project.user.toString() != req.loggedUser.id) 
    return next(new NotAllowedError('user not owner for ths project'));

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.team_project, ...attachments);
    (req.body as any).attachments = attachments.map(
      (el) => `${FOLDERS.team_project}/${el.filename}`,
    );
    await s3.removeBucketFiles(...project.attachments);
    Files.removeFiles(...(req.body as any).attachments);
  }
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.team_project, ...cover);
    req.body.cover = `${FOLDERS.team_project}/${cover[0].filename}`;
    await s3.removeBucketFiles(project.cover);
    Files.removeFiles(req.body.cover);
  }

  const updatedProject = <IteamProject>(await TeamProject.findByIdAndUpdate(req.params.projectId , req.body , {new:true}));
  res.status(200).json({message:'success' , data:updatedProject});
};