import { IPage, Pages, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmPagesController: RequestHandler<
  unknown,
  PaginationResponse<{ data: IPage[] }>
> = async (req, res) => {
  const page = await Pages.find();

  const result = await Pages.countDocuments();

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount: result,
      totalPages: Math.ceil(result / req.pagination.limit),
    },
    data: page,
  });
};
