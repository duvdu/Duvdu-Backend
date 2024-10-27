import 'express-async-errors';
import {
  BadRequestError,
  Bucket,
  CategoryMedia,
  CYCLES,
  filterTagsForCategory,
  FOLDERS,
  IprojectCycle,
  MODELS,
  Project,
  ProjectCycle,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { inviteCreatives } from '../../services/inviteCreative.service';
import { sendNotification } from '../book/sendNotification';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IprojectCycle }>,
  Pick<
    IprojectCycle,
    | 'address'
    | 'attachments'
    | 'category'
    | 'cover'
    | 'description'
    | 'functions'
    | 'duration'
    | 'location'
    | 'name'
    | 'projectScale'
    | 'searchKeyWords'
    | 'showOnHome'
    | 'tools'
    | 'subCategory'
    | 'tags'
    | 'audioCover'
    | 'creatives'
  > & { subCategoryId: string; tagsId: string[]; invitedCreatives: { number: string }[] },
  unknown
> = async (req, res, next) => {
  try {
    // Extract files from request
    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    const cover = <Express.Multer.File[]>(req.files as any).cover;
    const audioCover = <Express.Multer.File[]>(req.files as any).audioCover;

    // Filter and prepare tags for category
    const { filteredTags, subCategoryTitle, media } = await filterTagsForCategory(
      req.body.category.toString(),
      req.body.subCategoryId,
      req.body.tagsId,
      CYCLES.portfolioPost,
      req.lang,
    );
    req.body.subCategory = {...subCategoryTitle! , _id:req.body.subCategoryId};
    req.body.tags = filteredTags;

    // Validate creatives if present

    if (req.body.creatives) {
      const creativeCount = await Users.countDocuments({
        _id: { $in: req.body.creatives.map((el) => el.creative) },
      });
      if (creativeCount !== req.body.creatives.length) {
        return next(
          new BadRequestError(
            { en: 'Invalid creatives', ar: 'مستخدمو المحتويات الإبداعية غير الصالحين' },
            req.lang,
          ),
        );
      }
    }

    let invitedCreative;
    if (req.body.invitedCreatives)
      invitedCreative = (await inviteCreatives(req.body.invitedCreatives)) || [];

    const s3 = new Bucket();

    if (media === CategoryMedia.image) {
      const imageFiles = filterFilesByType(attachments, 'image/');
      if (imageFiles.length !== 1) {
        return next(
          new BadRequestError(
            {
              en: 'There must be exactly one image file as an attachment',
              ar: 'يجب أن يكون هناك ملف صورة واحد كمرفق',
            },
            req.lang,
          ),
        );
      }
    } else if (media === CategoryMedia.audio) {
      const audioFiles = filterFilesByType(attachments, 'audio/');
      if (audioFiles.length !== 1) {
        return next(
          new BadRequestError(
            {
              en: 'There must be exactly one audio file as an attachment',
              ar: 'يجب أن يكون هناك ملف صوتي واحد كمرفق',
            },
            req.lang,
          ),
        );
      }
    } else if (media === CategoryMedia.video) {
      const videoFiles = filterFilesByType(attachments, 'video/');
      if (videoFiles.length !== 1) {
        return next(
          new BadRequestError(
            {
              en: 'There must be exactly one video file as an attachment',
              ar: 'يجب أن يكون هناك ملف فيديو واحد كمرفق',
            },
            req.lang,
          ),
        );
      }
    }

    // Validate cover file based on media type
    if (media === CategoryMedia.image || media === CategoryMedia.audio) {
      if (!cover[0].mimetype.startsWith('image/')) {
        return next(
          new BadRequestError(
            { en: 'Cover must be an image', ar: 'يجب أن يكون الغلاف صورة' },
            req.lang,
          ),
        );
      }

      // Additional validation for audio media
      if (media === CategoryMedia.audio) {
        if (
          !audioCover ||
          audioCover.length === 0 ||
          !audioCover[0].mimetype.startsWith('audio/')
        ) {
          return next(
            new BadRequestError(
              {
                en: 'Audio cover is required and must be an audio file',
                ar: 'يجب أن يكون الغلاف الصوتي صوتيًا',
              },
              req.lang,
            ),
          );
        }
        await s3.saveBucketFiles(FOLDERS.portfolio_post, ...audioCover);
        req.body.audioCover = `${FOLDERS.portfolio_post}/${audioCover[0].filename}`;
      }
    } else if (media === CategoryMedia.video) {
      if (!cover[0].mimetype.startsWith('video/')) {
        return next(
          new BadRequestError(
            { en: 'Cover must be a video for video media type', ar: 'يجب أن يكون الغلاف فيديو' },
            req.lang,
          ),
        );
      }
    }

    // Save cover and attachments to bucket
    await s3.saveBucketFiles(FOLDERS.portfolio_post, ...attachments, ...cover);
    req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    req.body.attachments = attachments.map((f) => `${FOLDERS.portfolio_post}/${f.filename}`);

    // Create project cycle and project records
    const projectCycle = await ProjectCycle.create({
      ...req.body,
      user: req.loggedUser.id,
      creatives: [
        ...(req.body.creatives ? req.body.creatives : []),
        ...(invitedCreative ? invitedCreative : []),
      ],
    });

    await Project.create({
      _id: projectCycle._id,
      project: { type: projectCycle.id, ref: MODELS.portfolioPost },
      user: req.loggedUser.id,
      ref: MODELS.portfolioPost,
    });

    const loggedUser = await Users.findById(req.loggedUser.id);

    if (projectCycle.creatives.length > 0) {
      for (const creative of projectCycle.creatives) {
        await sendNotification(
          req.loggedUser.id,
          creative.creative.toString(),
          projectCycle._id.toString(),
          'new tag',
          'You were mentioned in the project.',
          `${loggedUser?.name} has tagged you in his project. Accept or decline.`,
          'new-tag',
        );
      }
    }
    const totalProjectPrice =
      projectCycle.tools.reduce((acc, tool) => acc + tool.unitPrice, 0) +
      projectCycle.functions.reduce((acc, func) => acc + func.unitPrice, 0) +
      projectCycle.projectScale.pricerPerUnit * projectCycle.projectScale.current;
    await ProjectCycle.updateOne(
      { _id: projectCycle._id },
      { minBudget: totalProjectPrice, maxBudget: totalProjectPrice },
    );

    // Respond with success message
    res.status(201).json({ message: 'success', data: projectCycle });
  } catch (error) {
    console.error('Error creating project:', error);
    next(error);
  }
};

export const filterFilesByType = (
  attachments: Express.Multer.File[],
  mimeType: string,
): Express.Multer.File[] => {
  return attachments.filter((file) => file.mimetype.startsWith(mimeType));
};
