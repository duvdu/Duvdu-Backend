import { PaginationResponse, CopyRights, IcopyRights } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    user?: string;
    address?: string;
    category?: string;
    priceFrom?: number;
    priceTo?: number;
    isDeleted?: boolean;
    startDate?: Date;
    endDate?: Date;
    tags?:string;
    subCategory?:string
  }
> = (req, res, next) => {
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.user) req.pagination.filter.user = req.query.user;
  if (req.query.address)
    req.pagination.filter.address = { $regex: req.query.address, $options: 'i' };
  if (req.query.priceFrom) req.pagination.filter.price = { $gte: req.query.priceFrom };
  if (req.query.priceTo)
    req.pagination.filter.price = {
      ...req.pagination.filter.projectBudget,
      $lte: req.query.priceTo,
    };
  if (req.query.category) req.pagination.filter.category = req.query.category;
  if (req.query.startDate || req.query.endDate)
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  if (req.query.isDeleted !== undefined) {
    req.pagination.filter.isDeleted = req.query.isDeleted ? true : { $ne: true };
  }
  if (req.query.subCategory) {
    req.pagination.filter[`subCategory.${req.lang}`] = req.query.subCategory;
  }
  if (req.query.tags) {
    req.pagination.filter['tags.' + req.lang] = req.query.tags;
  }
  next();
};

export const getProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcopyRights[] }>
> = async (req, res) => {
  const resultCount = await CopyRights.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });

  const projects = await CopyRights.aggregate([
    {
      $match: { ...req.pagination.filter, isDeleted: { $ne: true } }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $limit: req.pagination.limit
    },
    {
      $skip: req.pagination.skip
    },
    {
      $addFields: {
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              $cond: {
                if: {$eq: ['ar', req.lang] },
                then: '$$tag.ar',
                else: '$$tag.en'
              }
            }
          }
        },
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en'
          }
        }
      }
    }
  ]);
    

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: projects,
  });
};
