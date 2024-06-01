/* eslint-disable indent */
import {
  CopyRights,
  IportfolioPost,
  NotFound,
  PortfolioPosts,
  studioBooking,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Rates } from '../../models/rate.model';

export const createRateHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { project: string; cycle: number; rate: number; desc: string }
> = async (req, res, next) => {
  const project = <IportfolioPost>await getProjectByCycle(req.body.project, req.body.cycle);
  if (!project) return next(new NotFound({en:'project not found' , ar: 'المشروع غير موجود'} , req.lang));

  await Rates.create({
    project: { id: req.body.project, cycle: req.body.cycle },
    rate: req.body.rate,
    desc: req.body.desc,
    sourceUser: req.loggedUser.id,
  });

  project.rate;
};

export const getProjectByCycle = async (projectId: string, cycle: number) => {
  switch (cycle) {
    case 1:
      return await PortfolioPosts.findById(projectId);
    case 2:
      return await studioBooking.findById(projectId);
    case 3:
      return await CopyRights.findById(projectId);
    // case 4:
    //   return await PortfolioPosts.findById(projectId);
    // case 5:
    //   return await PortfolioPosts.findById(projectId);
    default:
      return undefined;
  }
};
