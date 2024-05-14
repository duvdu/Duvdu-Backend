import { Bucket, FOLDERS, NotFound, PortfolioPosts, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { IportfolioPostBooking, PortfolioPostBooking } from '../../models/booking.model';

export const bookProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IportfolioPostBooking }>,
  {
    attachments?: string[];
    tools?: string[];
    creatives?: string[];
    jobDetails: string;
    location: { lat: number; lng: number };
    address: string;
    customRequirements: { measure: number; unit: string };
    shootingDays: number;
    appointmentDate: Date;
    totalPrice: number;
    startDate: Date;
    deadline: Date;
  }
> = async (req, res, next) => {
  const attachments = <Express.Multer.File[] | undefined>(req.files as any).attachments;

  const project = await PortfolioPosts.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  });
  if (!project) return next(new NotFound('project not found'));

  const toolsWithFees: { name: string; fees: number }[] = [];
  // assert tools
  if (req.body.tools)
    for (const tool of req.body.tools) {
      const equip = project.tools.find((el: any) => el._id.toString() === tool);
      if (!equip) return next(new NotFound('Equipment not found in this project'));
      toolsWithFees.push(equip);
    }

  const creativesWithFees: { creative: string; fees: number }[] = [];
  // assert creatives
  if (req.body.creatives)
    for (const creativeId of req.body.creatives) {
      const creative = project.creatives.find((el: any) => el._id.toString() === creativeId);
      if (!creative) return next(new NotFound('Equipment not found in this project'));
      creativesWithFees.push(creative as any);
    }

  // handle media
  if (attachments) {
    req.body.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
    await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments);
  }

  // calc total price
  const totalPrice =
    toolsWithFees.reduce((acc, el) => acc + el.fees, 0) +
    creativesWithFees.reduce((acc, el) => acc + el.fees, 0) +
    project.projectBudget;

  // deadline
  req.body.deadline = new Date(
    new Date(req.body.startDate).getTime() + new Date(req.body.startDate).getTime(),
  );

  // create booking
  const booking = await PortfolioPostBooking.create({
    ...req.body,
    sourceUser: req.loggedUser.id,
    targetUser: project.user,
    project: project.id,
    tools: toolsWithFees,
    creatives: creativesWithFees,
    totalPrice: totalPrice,
  });

  return res.status(200).json({ message: 'success', data: booking });
};
