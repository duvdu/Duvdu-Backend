import 'express-async-errors';
import { Bucket, Files, FOLDERS, NotFound, Project, Report } from '@duvdu-v1/duvdu';

import { CreateReportHandler } from '../../types/endpoints/report.endpoints';

export const createReportHandler: CreateReportHandler = async (req, res, next) => {
  const attachments = <Express.Multer.File[]>(req.files as any)?.attachments;
  const project = await Project.findOne({ 'project.type': req.body.project });
  if (!project) return next(new NotFound(undefined, req.lang));

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.report, ...attachments);
    (req.body as any).attachments = attachments.map((el) => `${FOLDERS.report}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }
  const report = await Report.create({
    ...req.body,
    project: project._id,
    sourceUser: req.loggedUser.id,
  });

  
  res.status(201).json({ message: 'success', data: report });
};
