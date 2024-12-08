import {
  Bucket,
  ContractReports,
  Contracts,
  CopyrightContractStatus,
  FOLDERS,
  NotFound,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

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

  const populatedContract = await contract.populate({
    path: 'contract',
    model: contract.ref
  });

  const s3 = new Bucket();
  if (attachments) {
    await s3.saveBucketFiles(FOLDERS.report, ...attachments);
    (req.body as any).attachments = attachments.map((el) => `${FOLDERS.report}/${el.filename}`);
  }

  // Get the model dynamically based on contract type
  const ContractModel = mongoose.model(contract.ref);

  // Create complaint report
  await ContractReports.create({
    attachments: req.body.attachments,
    desc: req.body.desc,
    reporter: req.loggedUser.id,
    contract: populatedContract.contract._id,
    ref: populatedContract.ref,
  });

  // Update using the model instead of the populated field
  await ContractModel.updateOne(
    { _id: populatedContract.contract._id },
    { status: CopyrightContractStatus.complaint }
  );
  
  // TODO: send event for admin about new complaint
  res.status(201).json({ message: 'success' });
};
