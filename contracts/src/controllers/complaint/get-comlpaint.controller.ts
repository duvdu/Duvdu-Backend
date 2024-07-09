import 'express-async-errors';
import {
  ContractReports,
  IcontractReport,
  Iuser,
  NotFound,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
// TODO: test complaint apis
export const getComplaintHandler: RequestHandler<
  { complaintId: string },
  SuccessResponse<{ data: IcontractReport }>
> = async (req, res, next) => {
  const complaint = await ContractReports.findOne(
    req.loggedUser.role.key === 'admin'
      ? { _id: req.params.complaintId }
      : { _id: req.params.complaintId, reporter: req.loggedUser.id },
  )
    .populate([
      {
        path: 'reporter',
        select: 'name username profileImage isOnline',
      },
      // {
      //   path: 'contract',
      // },
    ])
    .lean();

  if (!complaint) return next(new NotFound(undefined, req.lang));

  (complaint.reporter as Iuser).profileImage =
    process.env.BUCKET_HOST + '/' + (complaint?.reporter as Iuser).profileImage;

  complaint.attachments = complaint.attachments.map((el) => process.env.BUCKET_HOST + '/' + el);

  res.status(200).json({ message: 'success', data: complaint });
};
