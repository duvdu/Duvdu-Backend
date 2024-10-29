import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Categories,
  CategoryMedia,
  Files,
  FOLDERS,
  IprojectCycle,
  NotAllowedError,
  NotFound,
  ProjectCycle,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { filterFilesByType } from './createProject.controller';

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
  >,
  unknown
> = async (req, res, next) => {
  const project = await ProjectCycle.findOne({
    user: req.loggedUser.id,
    _id: req.params.projectId,
  });
  if (!project) return next(new NotAllowedError(undefined, req.lang));

  const category = await Categories.findById(project.category);
  if (!category)
    return next(new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang));

  const media = category.media;

  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;
  const audioCover = <Express.Multer.File[]>(req.files as any).audioCover;

  const s3 = new Bucket();
  if (attachments) {
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

    await s3.saveBucketFiles(FOLDERS.portfolio_post, ...attachments);
    req.body.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
    Files.removeFiles(...req.body.attachments);
  }

  if (cover) {
    if (media === 'image' || media === 'audio') {
      if (!cover[0].mimetype.startsWith('image/')) {
        return next(
          new BadRequestError(
            { en: 'Cover must be an image ', ar: 'يجب أن يكون الغلاف صورة' },
            req.lang,
          ),
        );
      }
      await s3.saveBucketFiles(FOLDERS.portfolio_post, ...cover);
      req.body.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    } else if (media === 'video') {
      if (!cover[0].mimetype.startsWith('video/')) {
        return next(
          new BadRequestError(
            { en: 'Cover must be a video for video media type', ar: 'يجب أن يكون الغلاف فيديو ' },
            req.lang,
          ),
        );
      }
    }
    Files.removeFiles(req.body.cover);
  }

  if (audioCover && category.media === CategoryMedia.audio) {
    if (!audioCover[0].mimetype.startsWith('audio/')) {
      return next(
        new BadRequestError(
          { en: 'Audio cover must be an audio file', ar: 'يجب أن يكون الغلاف الصوتي صوتيًا' },
          req.lang,
        ),
      );
    }
    await s3.saveBucketFiles(FOLDERS.portfolio_post, ...audioCover);
    req.body.audioCover = `${FOLDERS.portfolio_post}/${audioCover[0].filename}`;
    Files.removeFiles(req.body.audioCover);
  }

  if (req.body.location)
    req.body.location = {
      type: 'Point',
      coordinates: [(req as any).body.location.lng, (req as any).body.location.lat],
    } as any;

  const updatedProject = await ProjectCycle.findOneAndUpdate(
    { _id: req.params.projectId, user: req.loggedUser.id },
    req.body,
    { new: true },
  );
  if (!updatedProject)
    return next(
      new BadRequestError({ en: 'failed to update project', ar: 'فشل في تحديث المشروع' }, req.lang),
    );

  attachments && (await s3.removeBucketFiles(...project.attachments));
  cover && (await s3.removeBucketFiles(project.cover));
  audioCover && (await s3.removeBucketFiles(project.audioCover));

  const totalProjectPrice =
    updatedProject.tools.reduce((acc, tool) => acc + tool.unitPrice, 0) +
    updatedProject.functions.reduce((acc, func) => acc + func.unitPrice, 0) +
    updatedProject.projectScale.pricerPerUnit * updatedProject.projectScale.current;
  await ProjectCycle.updateOne(
    { _id: updatedProject._id },
    { minBudget: totalProjectPrice, maxBudget: totalProjectPrice },
  );

  res.status(200).json({ message: 'success', data: updatedProject });
};
