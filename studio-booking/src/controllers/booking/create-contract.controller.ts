import {
  SuccessResponse,
  NotFound,
  NotAllowedError,
  BadRequestError,
  ContractStatus,
  Contracts,
  CYCLES,
  addToDate,
  Setting,
  Rentals,
  Bucket,
  FOLDERS,
  Users,
  Channels,
  RentalContracts,
  MODELS,
  checkUserFaceVerification,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';
import { getPendingExpiration } from '../../config/expiration-queue';

export const createContractHandler: RequestHandler<
  { projectId: string },
  SuccessResponse,
  {
    details: string;
    projectScale: { numberOfUnits: number };
    startDate: string;
    attachments: string[];
  }
> = async (req, res, next) => {
  const isVerified = await checkUserFaceVerification(req.loggedUser.id);

  if (!isVerified)
    return next(
      new BadRequestError(
        { en: 'user not verified with face recognition', ar: 'المستخدم غير موثوق بالوجه' },
        req.lang,
      ),
    );

  const files = req.files as Express.Multer.File[] | undefined;

  // Validate project and other checks first
  const project = await Rentals.findOne({ _id: req.params.projectId, isDeleted: { $ne: true } });
  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));

  if (project.user.toString() === req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  if (
    project.projectScale.minimum > req.body.projectScale.numberOfUnits ||
    project.projectScale.maximum < req.body.projectScale.numberOfUnits
  )
    return next(
      new BadRequestError({ en: 'invalid number of units', ar: 'عدد الوحدات غير صالح' }, req.lang),
    );

  // Handle file uploads if files exist
  if (files?.length) {
    try {
      await new Bucket().saveBucketFiles(FOLDERS.studio_booking, ...files);
      req.body.attachments = files.map((file) => `${FOLDERS.studio_booking}/${file.filename}`);
    } catch (error) {
      return next(
        new BadRequestError({ en: 'File upload failed', ar: 'فشل تحميل الملف' }, req.lang),
      );
    }
  }

  const deadline = addToDate(
    new Date(req.body.startDate),
    project.projectScale.unit,
    req.body.projectScale.numberOfUnits,
  );

  const stageExpiration = await getStageExpiration(
    new Date(req.body.startDate).toString(),
    req.lang,
  );

  const contract = await RentalContracts.create({
    ...req.body,
    deadline,
    customer: req.loggedUser.id,
    sp: project.user,
    project: project._id,
    projectScale: {
      unit: project.projectScale.unit,
      numberOfUnits: req.body.projectScale.numberOfUnits,
      unitPrice: project.projectScale.pricerPerUnit,
    },
    location: { lat: project.location.coordinates[0], lng: project.location.coordinates[1] },
    address: project.address,
    totalPrice: (req.body.projectScale.numberOfUnits * project.projectScale.pricerPerUnit).toFixed(
      2,
    ),
    insurance: project.insurance,
    stageExpiration,
    status: ContractStatus.pending,
  });

  const delay = contract.stageExpiration * 3600 * 1000;
  const pendingQueue = getPendingExpiration();
  if (pendingQueue) {
    await pendingQueue.add('update-contract', { contractId: contract._id.toString() }, { delay });
  }

  await Contracts.create({
    _id: contract._id,
    customer: contract.customer,
    sp: contract.sp,
    contract: contract.id,
    ref: MODELS.rentalContract,
    cycle: CYCLES.studioBooking,
    ticketNumber: contract.ticketNumber,
  });

  const user = await Users.findById(req.loggedUser.id);

  // Send notifications in parallel
  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'new rental contract',
      `new contract created by ${user?.name}`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      req.loggedUser.id,
      contract._id.toString(),
      'contract',
      'new rental contract',
      'you created new contract successfully',
      Channels.notification,
    ),
  ]);

  res.status(201).json({ message: 'success' });
};

// Helper functions remain unchanged
async function getStageExpiration(isoDate: string, lang: string) {
  const givenDate = new Date(isoDate);
  const currentDate = new Date();

  const timeDifferenceInHours = Math.abs(
    (givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60),
  );
  console.log(timeDifferenceInHours);

  const settings = await Setting.findOne().exec();

  if (!settings) {
    throw new NotFound({ en: 'setting not found', ar: 'الإعداد غير موجود' }, lang);
  }

  const validTimes = settings.expirationTime
    .map((entry) => entry.time)
    .filter((time) => time % 2 === 0 && time * 2 <= timeDifferenceInHours);

  if (validTimes.length === 0) {
    throw new BadRequestError(
      {
        en: `the minimum difference time between booking and now must be at least ${settings.expirationTime[0].time * 2} hour`,
        ar: `الحد الأدنى للفترة الزمنية بين وقت الحجز والوقت الحالي يجب أن يكون على الأقل ${settings.expirationTime[0].time * 2} ساعة`,
      },
      lang,
    );
  }

  let bestTime = validTimes[0];
  let smallestDifference = Math.abs(timeDifferenceInHours - validTimes[0]);

  for (const time of validTimes) {
    const difference = Math.abs(timeDifferenceInHours - time);
    if (difference < smallestDifference) {
      smallestDifference = difference;
      bestTime = time;
    }
  }

  return bestTime;
}
