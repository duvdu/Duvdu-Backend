import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Categories,
  CategoryMedia,
  FOLDERS,
  IprojectCycle,
  NotAllowedError,
  NotFound,
  ProjectContract,
  ProjectContractStatus,
  ProjectCycle,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { filterFilesByType } from './createProject.controller';

interface FileValidation {
  type: string;
  count: number;
  message: string;
  arMessage: string;
}

interface FileValidations {
  [key: string]: FileValidation;
}

const fileValidations: FileValidations = {
  image: {
    type: 'image/',
    count: 1,
    message: 'exactly one image file',
    arMessage: 'ملف صورة واحد',
  },
  audio: {
    type: 'audio/',
    count: 1,
    message: 'exactly one audio file',
    arMessage: 'ملف صوتي واحد',
  },
  video: {
    type: 'video/',
    count: 1,
    message: 'exactly one video file',
    arMessage: 'ملف فيديو واحد',
  },
};

export const updateProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IprojectCycle }>,
  Pick<
    IprojectCycle,
    | 'address'
    | 'attachments'
    | 'cover'
    | 'description'
    | 'duration'
    | 'location'
    | 'name'
    | 'projectScale'
    | 'searchKeyWords'
    | 'showOnHome'
    | 'audioCover'
    | 'functions'
    | 'tools'
    | 'isDeleted'
  >,
  unknown
> = async (req, res, next) => {
  try {
    // Find and validate project
    const project = await ProjectCycle.findOne({
      user: req.loggedUser.id,
      _id: req.params.projectId,
    });
    if (!project) {
      throw new NotAllowedError(undefined, req.lang);
    }

    if (Object.keys(req.body).some((key) => key !== 'showOnHome' && key !== 'isDeleted')) {
      // Check for active contracts
      const activeContract = await ProjectContract.findOne({
        project: req.params.projectId,
        status: {
          $nin: [
            ProjectContractStatus.rejected,
            ProjectContractStatus.completed,
            ProjectContractStatus.canceled,
          ],
        },
      });

      if (activeContract)
        throw new NotAllowedError(
          {
            en: 'Cannot update project with active contract',
            ar: 'لا يمكن تحديث المشروع مع وجود عقد نشط',
          },
          req.lang,
        );
    }

    // Find and validate category
    const category = await Categories.findById(project.category);
    if (!category) {
      throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang);
    }

    const media = category.media;

    // Extract files from request
    const { attachments, cover, audioCover } = req.files as {
      attachments?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      audioCover?: Express.Multer.File[];
    };

    // Validate files based on media type
    const validateFiles = async () => {
      if (attachments && media in fileValidations) {
        const validation = fileValidations[media];
        const validFiles = filterFilesByType(attachments, validation.type);
        if (validFiles.length !== validation.count) {
          throw new BadRequestError(
            {
              en: `There must be ${validation.message} as an attachment`,
              ar: `يجب أن يكون هناك ${validation.arMessage} كمرفق`,
            },
            req.lang,
          );
        }
      }
    };

    // Handle file uploads
    const s3 = new Bucket();
    const handleFileUploads = async () => {
      const uploadTasks = [];

      if (attachments) {
        uploadTasks.push(
          s3.saveBucketFiles(FOLDERS.portfolio_post, ...attachments).then(() => {
            req.body.attachments = attachments.map(
              (el) => `${FOLDERS.portfolio_post}/${el.filename}`,
            );
          }),
        );
      }

      if (cover) {
        const isCoverValid =
          media === 'image' || media === 'audio'
            ? cover[0].mimetype.startsWith('image/')
            : media === 'video'
              ? cover[0].mimetype.startsWith('video/')
              : false;

        if (!isCoverValid) {
          throw new BadRequestError(
            {
              en: `Cover must be ${media === 'video' ? 'a video' : 'an image'}`,
              ar: `يجب أن يكون الغلاف ${media === 'video' ? 'فيديو' : 'صورة'}`,
            },
            req.lang,
          );
        }

        uploadTasks.push(
          s3.saveBucketFiles(FOLDERS.portfolio_post, ...cover).then(() => {
            req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
          }),
        );
      }

      if (audioCover && media === CategoryMedia.audio) {
        if (!audioCover[0].mimetype.startsWith('audio/')) {
          throw new BadRequestError(
            {
              en: 'Audio cover must be an audio file',
              ar: 'يجب أن يكون الغلاف الصوتي صوتيًا',
            },
            req.lang,
          );
        }

        uploadTasks.push(
          s3.saveBucketFiles(FOLDERS.portfolio_post, ...audioCover).then(() => {
            req.body.audioCover = `${FOLDERS.portfolio_post}/${audioCover[0].filename}`;
          }),
        );
      }

      await Promise.all(uploadTasks);
    };

    // Execute validation and file uploads
    await validateFiles();
    await handleFileUploads();

    // Update project and clean up old files in parallel
    const [updatedProject] = await Promise.all([
      ProjectCycle.findOneAndUpdate(
        { _id: req.params.projectId, user: req.loggedUser.id },
        req.body,
        { new: true },
      ),
      project.attachments && attachments && s3.removeBucketFiles(...project.attachments),
      project.cover && cover && s3.removeBucketFiles(project.cover),
      project.audioCover && audioCover && s3.removeBucketFiles(project.audioCover),
    ]);

    if (!updatedProject) {
      throw new BadRequestError(
        { en: 'failed to update project', ar: 'فشل في تحديث المشروع' },
        req.lang,
      );
    }

    // Calculate total project price
    const totalProjectPrice =
      updatedProject.tools.reduce(
        (acc: number, tool: { unitPrice: number }) => acc + tool.unitPrice,
        0,
      ) +
      updatedProject.functions.reduce(
        (acc: number, func: { unitPrice: number }) => acc + func.unitPrice,
        0,
      ) +
      updatedProject.projectScale.pricerPerUnit * updatedProject.projectScale.current;

    // Update project price
    await ProjectCycle.updateOne(
      { _id: updatedProject._id },
      { minBudget: totalProjectPrice, maxBudget: totalProjectPrice },
    );

    res.status(200).json({ message: 'success', data: updatedProject });
  } catch (error) {
    next(error);
  }
};
