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
  {
    attachments: string[];
    cover: string;
    title: string;
    desc?: string;
    tools?: { name: string; fees: number }[];
    creatives?: { creative: string; fees: number }[];
    location: { lat: number; lng: number };
    address: string;
    category: string;
    subCategory: string;
    tags: string[];
    searchKeywords?: string[];
    projectBudget: number;
    projectScale: { scale: number; time: string };
    invitedCreatives?: { phoneNumber: { number: string }; fees: number }[];
    showOnHome: boolean;
  }
> = async (req, res, next) => {
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File>(req.files as any).cover[0];

    
  // handle category
  const { filteredTags, subCategoryTitle } = await filterTagsForCategory(
    req.body.category.toString(),
    req.body.subCategory,
    req.body.tags,
    CYCLES.portfolioPost,
  );

  // assert creatives
  const creativesCount = await Users.countDocuments({
    _id: req.body.creatives?.map((el) => el.creative),
  });
  if (req.body.creatives && creativesCount !== req.body.creatives.length)
    return next(new BadRequestError({en:'invalid creatives' , ar:'الإبداعات غير صالحة'} , req.lang));

  // handle unregistered creatives
  let invitedCreatives;
  if (req.body.invitedCreatives)
    invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);

  // handle media
  req.body.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
  req.body.cover = `${FOLDERS.portfolio_post}/${cover.filename}`;
  await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments, cover);
  Files.removeFiles(...req.body.attachments, req.body.cover);

  // create project
  const project = await PortfolioPosts.create({
    ...req.body,
    subCategory: subCategoryTitle,
    tags: filteredTags,
    creatives: [...(req.body.creatives || []), ...(invitedCreatives || [])],
    user: '662c9ac0cf033b86395d6e0b'
    // user: req.loggedUser.id
  });

  await Project.create({
    project: {
      type: project.id,
      ref: MODELS.portfolioPost,
    },
    ref: MODELS.portfolioPost,
  });
  res.status(201).json({ message: 'success', data: project });
};
