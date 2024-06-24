import 'express-async-errors';

import { BadRequestError, Bucket, CYCLES, Files, filterTagsForCategory, FOLDERS, MODELS, Project, ProjectCycle, Users } from '@duvdu-v1/duvdu';

import { CreateProjectHandler } from '../../types/endoints';



export const createProjectHandler:CreateProjectHandler = async (req,res,next)=>{
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const cover = <Express.Multer.File[]>(req.files as any).cover;

    const {filteredTags , subCategoryTitle , media} = await filterTagsForCategory(req.body.category.toString() , req.body.subCategoryId , req.body.tagsId , CYCLES.portfolioPost , req.lang);
    req.body.subCategory = subCategoryTitle;
    req.body.tags = filteredTags;

    console.log(filteredTags , subCategoryTitle , media);
  
    if (req.body.creatives) {
      const creativeCount = await Users.countDocuments({_id:req.body.creatives.map((el:any) => el)});
      if (creativeCount != req.body.creatives.length) 
        return next(new BadRequestError({en:'invalid creatives' , ar:'مستخدمو المحتويات الإبداعية غير الصالحين'} , req.lang));
    }

    await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments, ...cover);
    req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    req.body.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
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
    Files.removeFiles(...req.body.attachments, req.body.cover);

    const project = await ProjectCycle.create({
      ...req.body,
      user:req.loggedUser.id
    });

    
    await Project.create({
      project: { type: project.id, ref: MODELS.portfolioPost },
      user: req.loggedUser.id,
      ref: MODELS.portfolioPost,
    });

    res.status(201).json({message:'success' , data:project});
  } catch (error) {
    next(error);
  }

};