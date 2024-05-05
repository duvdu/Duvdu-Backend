import {
  SuccessResponse,
  BadRequestError,
  Users,
  PortfolioPosts,
  Bucket,
  Files,
  IportfolioPost,
  FOLDERS,
  Project,
  MODELS,
  CYCLES,
  filterTagsForCategory,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { createInvitedUsers } from '../../services/create-invited-users';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IportfolioPost }>,
  Pick<
    IportfolioPost,
    'title' | 'desc' | 'address' | 'category' | 'projectBudget' | 'projectScale' | 'showOnHome'
  > &
    Partial<Pick<IportfolioPost, 'creatives' | 'tools' | 'searchKeywords'>> & {
      invitedCreatives?: [{ phoneNumber: { number: string }; fees: number }];
      tags:string[] ;
      subCategory:string;
    }
> = async (req, res, next) => {
  try {
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const cover = <Express.Multer.File[]>(req.files as any).cover;
  
    const {filteredTags , subCategoryTitle} = await filterTagsForCategory(req.body.category.toString() , req.body.subCategory , req.body.tags , CYCLES.portfolioPost);
  
    (req.body.subCategory as any) = subCategoryTitle;
    (req.body.tags as any) = filteredTags;
  
    const creativesCount = await Users.countDocuments({
      _id: req.body.creatives?.map((el) => el.creative),
    });
    if (req.body.creatives && creativesCount !== req.body.creatives.length)
      return next(new BadRequestError('invalid creatives'));
    let invitedCreatives;
    if (req.body.invitedCreatives)
      invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);
  
    const project = await PortfolioPosts.create({
      ...req.body,
      creatives: [...(req.body.creatives || []), ...(invitedCreatives || [])],
      user: req.loggedUser.id,
    });
    await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments, ...cover);
    project.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    project.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
    await project.save();
    Files.removeFiles(...project.attachments, project.cover);
  
    await Project.create({
      project: {
        type: project.id,
        ref: MODELS.portfolioPost,
      },
      ref: MODELS.portfolioPost,
    });
    res.status(201).json({ message: 'success', data: project });
  } catch (error) {
    next(error);
  }
};
