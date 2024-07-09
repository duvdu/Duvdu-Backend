import {
  Bucket,
  ContractReports,
  Contracts,
  Files,
  FOLDERS,
  NotFound,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createComplaintHandler: RequestHandler<unknown, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const attachments = <Express.Multer.File[]>(req.files as any)?.attachments;
  const contract = await Contracts.findOne({
    contract: req.body.contractId,
    $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.report, ...attachments);
    (req.body as any).attachments = attachments.map((el) => `${FOLDERS.report}/${el.filename}`);
    Files.removeFiles(...(req.body as any).attachments);
  }
  await ContractReports.create({
    attachments: req.body.attachments,
    desc: req.body.desc,
    reporter: req.loggedUser.id,
    contract: contract.contract,
    ref: contract.ref,
  });
  // TODO: send event for admin about new complaint
  res.status(201).json({ message: 'success' });
};
