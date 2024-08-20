import {
  SuccessResponse,
  NotFound,
  NotAllowedError,
  BadRequestError,
  addToDate,
  ContractStatus,
  Contracts,
  CYCLES,
  Setting,
  Rentals,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { contractNotification } from './contract-notification.controller';
import { RentalContracts } from '../../models/rental-contracts.model';

export const createContractHandler: RequestHandler<
  { projectId: string },
  SuccessResponse,
  {
    details: string;
    projectScale: { numberOfUnits: number };
    startDate: string;
  }
> = async (req, res, next) => {
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
      new BadRequestError(
        { en: 'invalid number of units', ar: 'invalid number of units' },
        req.lang,
      ),
    );

  const deadline: Date = addToDate(
    new Date(req.body.startDate),
    project.projectScale.unit,
    req.body.projectScale.numberOfUnits,
  );
  const stageExpiration = await getStageExpiration(new Date(req.body.startDate).toString(), req.lang);

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
    location: project.location,
    address: project.address,

    totalPrice: (req.body.projectScale.numberOfUnits * project.projectScale.pricerPerUnit).toFixed(
      2,
    ),
    insurance: project.insurance,
    stageExpiration,
    status: ContractStatus.pending,
  });

  // await pendingExpiration.add(
  //   { contractId: contract._id.toString() },
  //   { delay: (stageExpiration || 0) * 60 * 60 * 1000 },
  // );

  await Contracts.create({
    customer: contract.customer,
    sp: contract.sp,
    contract: contract.id,
    ref: 'rental_contracts',
    cycle: CYCLES.studioBooking,
  });

  await contractNotification(contract.id, contract.sp.toString(), 'new rental contract created');

  res.status(201).json({ message: 'success' });
};

// const getStageExpiration = async (date: Date, lang: string) => {
//   const setting = await Setting.findOne({});
//   const storedExpirations = setting?.expirationTime.map((el) => el.time);
//   if (!storedExpirations || storedExpirations.length === 0)
//     throw new Error('stored expiry times not exists');

//   const contractTimeToBookingDate = +((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
//   if (contractTimeToBookingDate < storedExpirations[0] * 2)
//     throw new NotAllowedError(
//       {
//         en: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
//         ar: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
//       },
//       lang,
//     );
//   else if (contractTimeToBookingDate > storedExpirations.at(-1)! * 2)
//     return storedExpirations.at(-1);

//   const minimumAvailableExpirationStage =
//     storedExpirations[storedExpirations.findIndex((el) => el * 2 > contractTimeToBookingDate) - 1];

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
