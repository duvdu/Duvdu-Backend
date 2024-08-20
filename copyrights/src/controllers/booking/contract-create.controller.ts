// TODO: update contract

import {
  CopyRights,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Setting,
  Contracts,
  Bucket,
  FOLDERS,
  Files,
  CYCLES,
  addToDate,
  BadRequestError,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
// import { pendingExpiration } from '../../config/expiration-queue';
import { ContractStatus, CopyrightContracts } from '../../models/copyright-contract.model';

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
  // TODO:
  // status updateAfterFirst will end by appointmentDate + stage
> = async (req, res, next) => {
  // assert project
  const project = await CopyRights.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  });

  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  if (project.user.toString() === req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const attachments = req.files as Express.Multer.File[];
  if (attachments.length > 0) {
    req.body.attachments = attachments.map((el) => FOLDERS.copyrights + '/' + el.filename);
    await new Bucket().saveBucketFiles(FOLDERS.copyrights, ...attachments);
    Files.removeFiles(...req.body.attachments);
  }

  const deadline = addToDate(
    new Date(req.body.startDate),
    project.duration.unit as any,
    project.duration.value,
  ).toISOString();
  const stageExpiration = await getStageExpiration(new Date(deadline).toString(), req.lang);

  const contract = await CopyrightContracts.create({
    ...req.body,
    deadline,
    duration: project.duration,
    customer: req.loggedUser.id,
    sp: project.user,
    project: project._id,
    totalPrice: project.price,
    stageExpiration,
    status: ContractStatus.pending,
  });

  await Contracts.create({
    customer: contract.customer,
    sp: contract.sp,
    contract: contract.id,
    ref: 'copyright_contracts',
    cycle: CYCLES.copyRights,
  });
  // await contractNotification(contract.id, contract.sp.toString(), 'copyright contract created');

  // await pendingExpiration.add(
  //   { contractId: contract.id },
  //   { delay: (stageExpiration || 0) * 60 * 60 * 1000 },
  // );

  // TODO: send notification
  res.status(201).json({ message: 'success', data: { contractId: contract.id } });
};

// const getStageExpiration = async (date: Date, lang: string) => {
//   const setting = await Setting.findOne({});
//   const storedExpirations = setting?.expirationTime.map((el) => el.time);
//   if (!storedExpirations || storedExpirations.length === 0)
//     throw new Error('stored expiry times not exists');

//   const contractTimeToBookingDate = +((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
//   if (contractTimeToBookingDate < storedExpirations[0] * 3)
//     throw new NotAllowedError(
//       {
//         en: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
//         ar: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
//       },
//       lang,
//     );
//   else if (contractTimeToBookingDate > storedExpirations.at(-1)! * 3)
//     return storedExpirations.at(-1);

//   const minimumAvailableExpirationStage =
//     storedExpirations[storedExpirations.findIndex((el) => el * 3 > contractTimeToBookingDate) - 1];

//   return minimumAvailableExpirationStage;
// };

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