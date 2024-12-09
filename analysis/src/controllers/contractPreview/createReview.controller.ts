import 'express-async-errors';

import {
  BadRequestError,
  ContractReview,
  Contracts,
  NotAllowedError,
  NotFound,
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

  res.status(201).json({ message: 'success', data: newReview });
};
