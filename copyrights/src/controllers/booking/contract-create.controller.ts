import {
  CopyRights,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Setting,
  Contracts,
  Bucket,
  FOLDERS,
  CYCLES,
  addToDate,
  BadRequestError,
  Users,
  Channels,
  CopyrightContractStatus,
  CopyrightContracts,
  MODELS,
  checkUserFaceVerification,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';
import { getPendingExpirationQueue } from '../../config/expiration-queue';

async function handleAttachments(attachments: Express.Multer.File[]) {
  if (!attachments.length) return [];

  const fileNames = attachments.map((el) => `${FOLDERS.copyrights}/${el.filename}`);
  const bucket = new Bucket();

  // Run file operations in parallel
  await Promise.all([bucket.saveBucketFiles(FOLDERS.copyrights, ...attachments)]);

  return fileNames;
}

export const createContractHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: { contractId: string } }>,
  {
    details: string;
    startDate: string;
    appointmentDate: string;
    location: { lat: number; lng: number };
    address: string;
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

  // assert project
  const project = await CopyRights.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  });

  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  if (project.user.toString() === req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  // Handle attachments
  req.body.attachments = await handleAttachments(req.files as Express.Multer.File[]);

  const deadline = addToDate(
    new Date(req.body.startDate),
    project.duration.unit as any,
    project.duration.value,
  ).toISOString();

  // Run these operations in parallel
  const [stageExpiration, user] = await Promise.all([
    getStageExpiration(new Date(deadline).toString(), req.lang),
    Users.findById(req.loggedUser.id),
  ]);

  // Create both contracts in parallel
  const [contract] = await Promise.all([
    CopyrightContracts.create({
      ...req.body,
      deadline,
      duration: project.duration,
      customer: req.loggedUser.id,
      sp: project.user,
      project: project._id,
      totalPrice: project.price,
      stageExpiration,
      status: CopyrightContractStatus.pending,
    }),
  ]);

  await Contracts.create({
    _id: contract._id,
    customer: req.loggedUser.id,
    contract: contract._id,
    sp: project.user,
    ref: MODELS.copyrightContract,
    cycle: CYCLES.copyRights,
    ticketNumber: contract.ticketNumber,
  });

  // add to queue
  const delay = contract.stageExpiration * 3600 * 1000;
  await getPendingExpirationQueue()?.add(
    'pending_expiration_job',
    {
      contractId: contract._id.toString(),
    },
    { delay },
  );

  // Send notifications in parallel with response
  Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'new contract',
      `new contract created from ${user?.name}`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      req.loggedUser.id,
      contract._id.toString(),
      'contract',
      'new contract',
      'contract created successfully',
      Channels.notification,
    ),
  ]);

  res.status(201).json({ message: 'success', data: { contractId: contract.id } });
};

async function getStageExpiration(isoDate: string, lang: string) {
  const givenDate = new Date(isoDate);
  const currentDate = new Date();

  const timeDifferenceInHours = Math.abs(
    (givenDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60),
  );

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
