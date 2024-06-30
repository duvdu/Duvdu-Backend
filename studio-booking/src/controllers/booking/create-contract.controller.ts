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
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { RentalContracts } from '../../models/rental-contracts.model';
import { Rentals } from '../../models/rental.model';

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
  const stageExpiration = await getStageExpiration(new Date(req.body.startDate), req.lang);

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

    totalPrice: (req.body.projectScale.numberOfUnits * project.projectScale.pricerPerUnit).toFixed(
      2,
    ),
    insurance: project.insurance,
    stageExpiration,
    status: ContractStatus.pending,
  });

  console.log(contract);

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

  // TODO: send notification

  res.status(201).json({ message: 'success' });
};

const getStageExpiration = async (date: Date, lang: string) => {
  const setting = await Setting.findOne({});
  const storedExpirations = setting?.expirationTime.map((el) => el.time);
  if (!storedExpirations || storedExpirations.length === 0)
    throw new Error('stored expiry times not exists');

  const contractTimeToBookingDate = +((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  if (contractTimeToBookingDate < storedExpirations[0] * 2)
    throw new NotAllowedError(
      {
        en: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
        ar: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
      },
      lang,
    );
  else if (contractTimeToBookingDate > storedExpirations.at(-1)! * 2)
    return storedExpirations.at(-1);

  const minimumAvailableExpirationStage =
    storedExpirations[storedExpirations.findIndex((el) => el * 2 > contractTimeToBookingDate) - 1];

  return minimumAvailableExpirationStage;
};
