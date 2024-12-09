import 'express-async-errors';
import {
  BadRequestError,
  Bucket,
  Channels,
  Contracts,
  CYCLES,
  FOLDERS,
  NotAllowedError,
  NotFound,
  ProjectCycle,
  Users,
  ProjectContract,
  ProjectContractStatus,
  MODELS,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { calculateTotalPrice } from '../../services/checkToolsAndFunctions.service';
import { getBestExpirationTime } from '../../services/getBestExpirationTime.service';
import { CreateContractHandler } from '../../types/contract.endpoint';

export const createContractHandler: CreateContractHandler = async (req, res, next) => {
  try {
    // Project validation
    const project = await ProjectCycle.findOne({
      _id: req.params.projectId,
      isDeleted: { $ne: true },
    });

    if (!project)
      return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));

    if (req.loggedUser.id === project.user.toString())
      return next(new NotAllowedError(undefined, req.lang));

    // Scale validation
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

    // Enhanced file upload handling
    let uploadPromise = Promise.resolve();
    const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
    if (attachments && attachments.length > 0) {
      const bucket = new Bucket();
      req.body.attachments = attachments.map((el) => FOLDERS.portfolio_post + '/' + el.filename);

      // Process file upload in parallel
      uploadPromise = Promise.all([
        bucket.saveBucketFiles(FOLDERS.portfolio_post, ...attachments),
      ]).then(() => {});
    }

    // Parallel processing of deadline, expiration, and price calculations
    const [deadline, stageExpiration, priceData] = await Promise.all([
      Promise.resolve(
        new Date(
          new Date(req.body.startDate).setDate(
            new Date(req.body.startDate).getDate() + project.duration,
          ),
        ).toISOString(),
      ),
      getBestExpirationTime(req.body.appointmentDate.toString(), req.lang),
      calculateTotalPrice(project._id.toString(), req.body.equipment, req.lang),
    ]);

    const { functions, tools, totalPrice } = priceData;

    // Price calculations
    const unitPriceTotal = project.projectScale.pricerPerUnit * req.body.projectScale.numberOfUnits;
    const allPrice = totalPrice * req.body.projectScale.numberOfUnits + unitPriceTotal;

    // Create contract and wait for file upload in parallel
    const [contract] = await Promise.all([
      ProjectContract.create({
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
        status: ProjectContractStatus.pending,
        duration: project.duration,
        equipmentPrice: totalPrice,
      }),
      uploadPromise,
    ]);

    // Parallel processing of contract record creation and notifications
    const user = await Users.findById(req.loggedUser.id);
    await Promise.all([
      Contracts.create({
        _id: contract._id,
        customer: contract.customer,
        sp: contract.sp,
        contract: contract._id,
        ref: MODELS.projectContract,
        cycle: CYCLES.portfolioPost,
      }),
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'project new contract',
        `new contract created by ${user?.name}`,
        Channels.new_contract,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'project new contract',
        'contract created successfully',
        Channels.new_contract,
      ),
    ]);

    // Optional: Add expiration queue if needed
    // const delay = contract.stageExpiration * 3600 * 1000;
    // await pendingQueue.add({contractId:contract._id.toString()} , {delay});

    res.status(201).json(<any>{ message: 'success', data: contract });
  } catch (error) {
    next(error);
  }
};
