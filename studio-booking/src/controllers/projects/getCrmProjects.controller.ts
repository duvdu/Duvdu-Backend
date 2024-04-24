import 'express-async-errors';

import { IstudioBooking, PaginationResponse, studioBooking } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IstudioBooking[] }>
> = async (req, res) => {
  const resultCount = await studioBooking.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });
  const studioBookings = await studioBooking
    .find(req.pagination.filter)
    .sort('-createdAt')
    .limit(req.pagination.limit)
    .skip(req.pagination.skip);

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: studioBookings,
  });
};
