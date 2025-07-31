import { IPage, Pages, PageType, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getPagesController: RequestHandler<
  unknown,
  PaginationResponse<{ data: IPage[] }>,
  unknown,
  { type?: PageType }
> = async (req, res) => {
  const filter: any = {};

  if (req.query.type) {
    filter['type'] = req.query.type;
  }

  const page = await Pages.aggregate([
    {
      $match: filter,
    },
    {
      $project: {
        _id: 1,
        title: `$title.${req.lang}`,
        content: `$content.${req.lang}`,
      },
    },
  ]);

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
