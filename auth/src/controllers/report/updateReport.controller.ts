import 'express-async-errors';
import { NotFound, Report } from '@duvdu-v1/duvdu';

import { UpdateReportHandler } from '../../types/endpoints/report.endpoints';

export const updateReportHandler: UpdateReportHandler = async (req, res, next) => {
  const updatedReport = await Report.findByIdAndUpdate(
    req.params.reportId,
    {
      'state.isClosed': true,
      'state.closedBy': req.loggedUser.id,
      'state.feedback': req.body.feedback,
    },
    { new: true },
  ).populate({
    path: 'project',
    populate: {
      path: 'project.type',
    },
  });
  if (!updatedReport) return next(new NotFound(undefined, req.lang));

  res.status(200).json({ message: 'success', data: updatedReport });
};
