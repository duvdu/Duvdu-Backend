import 'express-async-errors';
import { NotFound, Report } from '@duvdu-v1/duvdu';

import { GetReportHandler } from '../../types/endpoints/report.endpoints';

export const getReportHandler: GetReportHandler = async (req, res, next) => {
  const report = await Report.findById(req.params.reportId).populate({
    path: 'project',
    populate: {
      path: 'project.type',
    },
  });

  if (!report) return next(new NotFound(undefined, req.lang));

  res.status(200).json({ message: 'success', data: report });
};
