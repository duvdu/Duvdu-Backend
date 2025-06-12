import { IWithdrawMethod, PaginationResponse, WithdrawMethodModel } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getMethodsCrm: RequestHandler<
  unknown,
  PaginationResponse<{ data: IWithdrawMethod[] }>,
  unknown
> = async (req, res) => {
  const methods = await WithdrawMethodModel.find()
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .sort({ createdAt: -1 });
  const resultCount = await WithdrawMethodModel.countDocuments();
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: methods,
  });
};
