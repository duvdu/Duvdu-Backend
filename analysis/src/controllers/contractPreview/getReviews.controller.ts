import 'express-async-errors';

import { ContractReview, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

import { GetReviewsHandler } from '../../types/endpoints/contractReview.endpoints';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    searchKeywords?: string[];
    contract?: string;
    sp?: string;
    customer?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};

  if (req.query.searchKeywords)
    req.pagination.filter.$or = req.query.searchKeywords.map((keyword: string) => ({
      comment: { $regex: keyword, $options: 'i' },
    }));

  if (req.query.sp) {
    const user = await Users.findOne({ username: req.query.sp });
    req.pagination.filter.user = new mongoose.Types.ObjectId(user?._id);
  }

  if (req.query.customer)
    req.pagination.filter.user = new mongoose.Types.ObjectId(req.query.customer);

  if (req.query.contract)
    req.pagination.filter.contract = new mongoose.Types.ObjectId(req.query.contract);

  next();
};

export const getReviewsHandler: GetReviewsHandler = async (req, res) => {
  const reviews = await ContractReview.find(req.pagination.filter)
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .sort({ createAt: -1 })
    .populate([
      {
        path: 'sp',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
      {
        path: 'customer',
        select:
          'profileImage projectsView rank rate name acceptedProjectsCounter isOnline username',
      },
    ]);

  const resultCount = await ContractReview.countDocuments(req.pagination.filter);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: reviews,
  });
};
