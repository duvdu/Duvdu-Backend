import 'express-async-errors';
import {
  BadRequestError,
  Bucket,
  CategoryMedia,
  CYCLES,
  filterRelatedCategoryForCategory,
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
import { Document, Types } from 'mongoose';

import { inviteCreatives, validateCreative } from '../../services/inviteCreative.service';
import { sendNotification } from '../book/sendNotification';

interface ProjectRequestBody
  extends Pick<
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
    | 'relatedCategory'
  > {
  subCategoryId: string;
  tagsId: string[];
  invitedCreatives: {
    number: string;
    mainCategory: {
      category: Types.ObjectId;
      subCategories: { subCategory: Types.ObjectId; tags: Types.ObjectId[] };
      relatedCategory: {
        category: Types.ObjectId;
        subCategories: { subCategory: Types.ObjectId; tags: Types.ObjectId[] };
      };
    };
  }[];
}

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IprojectCycle }>,
  ProjectRequestBody,
  unknown
> = async (req, res, next) => {
  try {
    // Extract files from request with type checking
    const files = req.files as
      | {
          attachments?: Express.Multer.File[];
          cover?: Express.Multer.File[];
          audioCover?: Express.Multer.File[];
        }
      | undefined;

    if (!files) {
      return next(
        new BadRequestError({ en: 'No files uploaded', ar: 'لم يتم تحميل أي ملفات' }, req.lang),
      );
    }

    const attachments = files.attachments || [];
    const cover = files.cover || [];
    const audioCover = files.audioCover || [];

    // Filter and prepare tags for category
    const { filteredTags, subCategoryTitle, media } = await filterTagsForCategory(
      req.body.category.toString(),
      req.body.subCategoryId,
      req.body.tagsId,
      CYCLES.portfolioPost,
      req.lang,
    );

    req.body.subCategory = { ...subCategoryTitle!, _id: req.body.subCategoryId };
    req.body.tags = filteredTags;
    if (req.body.relatedCategory) {
      const convertedRelatedCategory = req.body.relatedCategory.map((cat) => ({
        category: cat.category.toString(),
        subCategories: cat.subCategories?.map((sub) => ({
          subCategory: sub.subCategory.toString(),
          tags: sub.tags?.map((t) => ({ tag: t.tag.toString() })),
        })),
      }));
      await filterRelatedCategoryForCategory(
        req.body.category.toString(),
        convertedRelatedCategory,
        req.lang,
      );
    }

    // Validate media requirements
    await validateMediaRequirements(
      media as CategoryMedia,
      attachments,
      cover,
      audioCover,
      req.lang,
    );

    // Validate creatives if present
    if (req.body.creatives) {
      await validateCreative(req.body.creatives, req.lang);
    }

    // Handle invited creatives
    let invitedCreative: any = [];
    if (req.body.invitedCreatives) {
      invitedCreative = (await inviteCreatives(req.body.invitedCreatives, req.lang)) || [];
    }

    // Initialize S3 bucket and handle file uploads
    const s3 = new Bucket();
    const uploadTasks = [];

    // Handle cover upload
    if (cover.length > 0) {
      uploadTasks.push(
        s3.saveBucketFiles(FOLDERS.portfolio_post, cover[0]).then(() => {
          req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
        }),
      );
    }

    // Handle attachments upload
    if (attachments.length > 0) {
      uploadTasks.push(
        s3.saveBucketFiles(FOLDERS.portfolio_post, ...attachments).then(() => {
          req.body.attachments = attachments.map((f) => `${FOLDERS.portfolio_post}/${f.filename}`);
        }),
      );
    }

    // Handle audioCover upload
    if (audioCover.length > 0) {
      uploadTasks.push(
        s3.saveBucketFiles(FOLDERS.portfolio_post, audioCover[0]).then(() => {
          req.body.audioCover = `${FOLDERS.portfolio_post}/${audioCover[0].filename}`;
        }),
      );
    }

    // Execute all uploads in parallel
    await Promise.all(uploadTasks).catch((error) => {
      console.error('Upload error:', error);
      throw new BadRequestError(
        { en: 'Error uploading files', ar: 'خطأ في تحميل الملفات' },
        req.lang,
      );
    });

    // Process location data if present
    if (req.body.location) {
      req.body.location = {
        type: 'Point',
        coordinates: [(req.body.location as any).lng, (req.body.location as any).lat],
      };
    }

    // Create project cycle
    const projectCycle = await ProjectCycle.create({
      ...req.body,
      user: req.loggedUser.id,
      creatives: [...(req.body.creatives || []), ...invitedCreative],
    });

    // Create project record
    await Project.create({
      _id: projectCycle._id,
      project: { type: projectCycle.id, ref: MODELS.portfolioPost },
      user: req.loggedUser.id,
      ref: MODELS.portfolioPost,
    });

    // Handle notifications
    await handleProjectNotifications(projectCycle as IprojectCycle & Document, req.loggedUser.id);

    // Calculate and update project budget
    const totalProjectPrice = calculateProjectPrice(projectCycle);
    await ProjectCycle.updateOne(
      { _id: projectCycle._id },
      { minBudget: totalProjectPrice, maxBudget: totalProjectPrice },
    );

    // Update user projects count
    await Users.updateOne(
      { _id: req.loggedUser.id },
      { $inc: { projectsCount: 1 } },
    );

    // Send success response
    res.status(201).json({ message: 'success', data: projectCycle });
  } catch (error) {
    console.error('Error creating project:', error);
    next(error);
  }
};

// Helper Functions

async function validateMediaRequirements(
  media: CategoryMedia,
  attachments: Express.Multer.File[],
  cover: Express.Multer.File[],
  audioCover: Express.Multer.File[],
  lang: string,
) {
  const mediaValidators = {
    [CategoryMedia.image]: () => {
      const imageFiles = filterFilesByType(attachments, 'image/');
      if (imageFiles.length === 0) {
        throw new BadRequestError(
          {
            en: 'There must be exactly one image file as an attachment',
            ar: 'يجب أن يكون هناك ملف صورة واحد كمرفق',
          },
          lang,
        );
      }
    },
    [CategoryMedia.audio]: () => {
      const audioFiles = filterFilesByType(attachments, 'audio/');
      if (audioFiles.length === 0) {
        throw new BadRequestError(
          {
            en: 'There must be exactly one audio file as an attachment',
            ar: 'يجب أن يكون هناك ملف صوتي واحد كمرفق',
          },
          lang,
        );
      }
    },
    [CategoryMedia.video]: () => {
      const videoFiles = filterFilesByType(attachments, 'video/');
      if (videoFiles.length === 0) {
        throw new BadRequestError(
          {
            en: 'There must be exactly one video file as an attachment',
            ar: 'يجب أن يكون هناك ملف فيديو واحد كمرفق',
          },
          lang,
        );
      }
    },
  };

  // Execute media-specific validation
  mediaValidators[media]?.();

  // Validate cover based on media type
  if (
    (media === CategoryMedia.image || media === CategoryMedia.audio) &&
    !cover[0]?.mimetype.startsWith('image/')
  ) {
    throw new BadRequestError(
      { en: 'Cover must be an image', ar: 'يجب أن يكون الغلاف صورة' },
      lang,
    );
  }

  // Additional audio validation
  if (media === CategoryMedia.audio) {
    if (!audioCover?.[0]?.mimetype.startsWith('audio/')) {
      throw new BadRequestError(
        {
          en: 'Audio cover is required and must be an audio file',
          ar: 'يجب أن يكون الغلاف الصوتي صوتيًا',
        },
        lang,
      );
    }
  }

  // Video cover validation
  if (media === CategoryMedia.video && !cover[0]?.mimetype.startsWith('video/')) {
    throw new BadRequestError(
      { en: 'Cover must be a video for video media type', ar: 'يجب أن يكون الغلاف فيديو' },
      lang,
    );
  }
}

async function handleProjectNotifications(projectCycle: IprojectCycle & Document, userId: string) {
  if (projectCycle.creatives.length === 0) return;

  const loggedUser = await Users.findById(userId);

  for (const creative of projectCycle.creatives) {
    const creativeUser = await Users.findById(creative.creative);
    await Promise.all([
      sendNotification(
        userId,
        creative.creative.toString(),
        (projectCycle as any)._id.toString(),
        'new tag',
        'You were mentioned in the project.',
        `${loggedUser?.name} has tagged you in his project. Accept or decline.`,
        'new-tag',
      ),
      sendNotification(
        userId,
        creative.creative.toString(),
        (projectCycle as any)._id.toString(),
        'new tag',
        `tagged from project ${projectCycle.name}`,
        `you tagged ${creativeUser?.name} in your project successfully`,
        'new-tag',
      ),
    ]);
  }
}

function calculateProjectPrice(projectCycle: IprojectCycle): number {
  return (
    projectCycle.tools.reduce((acc, tool) => acc + tool.unitPrice, 0) +
    projectCycle.functions.reduce((acc, func) => acc + func.unitPrice, 0) +
    projectCycle.projectScale.pricerPerUnit * projectCycle.projectScale.current
  );
}

export const filterFilesByType = (
  attachments: Express.Multer.File[],
  mimeType: string,
): Express.Multer.File[] => {
  return attachments.filter((file) => file.mimetype.startsWith(mimeType));
};
