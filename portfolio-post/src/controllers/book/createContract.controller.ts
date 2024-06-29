import 'express-async-errors';

import {
  BadRequestError,
  Bucket,
  Contracts,
  CYCLES,
  Files,
  FOLDERS,
  NotAllowedError,
  NotFound,
  ProjectCycle,
} from '@duvdu-v1/duvdu';

import { ContractStatus, ProjectContract } from '../../models/projectContract.model';
import { calculateTotalPrice } from '../../services/checkToolsAndFunctions.service';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/contract.endpoint';

export const createContractHandler: CreateContractHandler = async (req, res, next) => {
  try {
    const project = await ProjectCycle.findOne({
      _id: req.params.projectId,
      isDeleted: { $ne: true },
    });

    if (!project)
      return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));

    if (req.loggedUser.id === project.user.toString())
      return next(new NotAllowedError(undefined, req.lang));

    if (req.body.projectScale.numberOfUnits < project.projectScale.minimum)
      return next(
        new BadRequestError(
          {
            en: `number of units must be greater than ${project.projectScale.minimum}`,
            ar: `يجب أن يكون عدد الوحدات أكبر من ${project.projectScale.minimum}`,
          },
          req.lang,
        ),
      );

    if (req.body.projectScale.numberOfUnits > project.projectScale.maximum)
      return next(
        new BadRequestError(
          {
            en: `number of units must be less than ${project.projectScale.maximum}`,
            ar: `يجب أن يكون عدد الوحدات اصغر من ${project.projectScale.maximum}`,
          },
          req.lang,
        ),
      );

    const attachments = <Express.Multer.File[]>(req.files as any).attachments;
    if (attachments) {
      req.body.attachments = attachments.map((el) => FOLDERS.portfolio_post + '/' + el.filename);
      await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments);
      Files.removeFiles(...req.body.attachments);
    }

    const deadline = new Date(
      new Date(req.body.startDate).setDate(
        new Date(req.body.startDate).getDate() + project.duration,
      ),
    ).toISOString();

    const stageExpiration = await getBestExpirationTime(
      req.body.appointmentDate.toString(),
      req.lang,
    );

    const { functions, tools, totalPrice } = await calculateTotalPrice(
      project._id.toString(),
      req.body.equipment,
      req.lang,
    );

    const unitPriceTotal = project.projectScale.pricerPerUnit * req.body.projectScale.numberOfUnits;
    const allPrice = totalPrice + unitPriceTotal;

    const contract = await ProjectContract.create({
      ...req.body,
      sp: project.user,
      customer: req.loggedUser.id,
      project: project._id,
      projectScale: {
        unit: project.projectScale.unit,
        numberOfUnits: req.body.projectScale.numberOfUnits,
        unitPrice: project.projectScale.pricerPerUnit,
      },
      totalPrice: allPrice,
      functions,
      tools,
      deadline,
      stageExpiration,
      status: ContractStatus.pending,
      duration: project.duration,
      equipmentPrice:totalPrice
    });

    await Contracts.create({
      customer: contract.customer,
      sp: contract.sp,
      contract: contract._id,
      ref: 'project_contracts',
      cycle: CYCLES.portfolioPost,
    });

    // send notification to sp
    // add expiration queue

    res.status(201).json(<any>{ message: 'success', data: contract });
  } catch (error) {
    next(error);
  }
};
