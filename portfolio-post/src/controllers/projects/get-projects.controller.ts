import { IportfolioPost, MODELS, PaginationResponse, PortfolioPosts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    address?: string;
    tools?: string[];
    tags?: string;
    subCategory?:string;
    projectBudgetFrom?: number;
    projectBudgetTo?: number;
    category?: string;
    creative?: string;
    isDeleted?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
> = (req, res, next) => {
  if (req.query.search) req.pagination.filter.$text = { $search: req.query.search };
  if (req.query.address)
    req.pagination.filter.address = { $regex: req.query.address, $options: 'i' };
  if (req.query.tools) req.pagination.filter.tools = { $elemMatch: { name: req.query.tools } };
  if (req.query.projectBudgetFrom)
    req.pagination.filter.projectBudget = { $gte: req.query.projectBudgetFrom };
  if (req.query.projectBudgetTo)
    req.pagination.filter.projectBudget = {
      ...req.pagination.filter.projectBudget,
      $lte: req.query.projectBudgetTo,
    };
  if (req.query.creative) {
    req.pagination.filter.$or = [
      { user: req.query.creative },
      { creatives: { $elemMatch: { creative: req.query.creative } } },
    ];
  }
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
  PaginationResponse<{ data: IportfolioPost[] }>
> = async (req, res) => {
  const resultCount = await PortfolioPosts.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });

  const projects = await PortfolioPosts.aggregate([
    {
      $match: {...req.pagination.filter , isDeleted: { $ne: true }}
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
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en'
          }
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              $cond: {
                if: { $eq: ['ar', req.lang] },
                then: '$$tag.ar',
                else: '$$tag.en'
              }
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: MODELS.user, 
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $addFields: {
        user: {
          $cond: {
            if: { $eq: [{ $size: '$userDetails' }, 0] }, 
            then: null,
            else: {
              $arrayElemAt: [
                '$userDetails',
                0
              ]
            }
          }
        }
      }
    },
    {
      $project: {
        user: {
          isOnline: '$user.isOnline',
          username: '$user.username',
          name: '$user.name',
          profileImage: '$user.profileImage',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter'
        },
        attachments: 1,
        cover: 1,
        studioName: 1,
        studioNumber: 1,
        studioEmail: 1,
        desc: 1,
        equipments: 1,
        location: 1,
        searchKeywords: 1,
        pricePerHour: 1,
        insurance: 1,
        showOnHome: 1,
        category: 1,
        cycle: 1,
        rate: 1,
        creatives: 1,
        tags: 1,
        subCategory: 1
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
