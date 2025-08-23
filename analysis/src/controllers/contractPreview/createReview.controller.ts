import 'express-async-errors';

import {
  BadRequestError,
  ContractReview,
  Contracts,
  NotAllowedError,
  NotFound,
  Users,
} from '@duvdu-v1/duvdu';

import { CreateReviewHandler } from '../../types/endpoints/contractReview.endpoints';

export const createReviewHandler: CreateReviewHandler = async (req, res, next) => {
  const review = await ContractReview.findOne({
    customer: req.loggedUser.id,
    contract: req.body.contract,
  });
  if (review)
    return next(
      new BadRequestError(
        {
          en: 'you already have a review in this project',
          ar: 'لديك بالفعل مراجعة في هذا المشروع',
        },
        req.lang,
      ),
    );

  const contract = await Contracts.findOne({ contract: req.body.contract }); //.populate('contract');
  if (!contract)
    return next(
      new NotFound({ en: 'contract not found', ar: 'لم يتم العثور على العقد' }, req.lang),
    );

  if (req.loggedUser.id != contract.customer.toString())
    return next(new NotAllowedError(undefined, req.lang));

  const newReview = await ContractReview.create({
    ...req.body,
    cycle: contract.cycle,
    sp: contract.sp,
    customer: req.loggedUser.id,
  });

  await updateUserRate(contract.sp.toString(), req.body.rate, true, req.lang);

  res.status(201).json({ message: 'success', data: newReview });
};

export async function updateUserRate(
  userId: string,
  rateChange: number,
  isAdd: boolean = true,
  lang: string,
) {
  const user = await Users.findById(userId);
  if (!user) throw new NotFound({ en: 'user not found', ar: 'لم يتم العثور على المستخدم' }, lang);

  const currentRaters = user.rate.ratersCounter;
  const currentTotalRates = user.rate.totalRates;

  let newAverage: number;
  const ratersDelta = isAdd ? 1 : -1;

  if (isAdd) {
    // Adding a new review
    newAverage = (currentTotalRates * currentRaters + rateChange) / (currentRaters + 1);
  } else {
    // Removing a review
    newAverage =
      currentRaters > 1
        ? (currentTotalRates * currentRaters - rateChange) / (currentRaters - 1)
        : 0;
  }

  await Users.findByIdAndUpdate(userId, {
    $inc: {
      'rate.ratersCounter': ratersDelta,
    },
    $set: {
      'rate.totalRates': Number(newAverage.toFixed(1)),
    },
  });
}
