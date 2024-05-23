import { IportfolioPost, MODELS, PaginationResponse, PortfolioPosts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IportfolioPost[] }>
> = async (req, res) => {
  const resultCount = await PortfolioPosts.countDocuments(req.pagination.filter);

  const projects = await PortfolioPosts.aggregate([
    {
      $match: req.pagination.filter
    },
    { $sort: { createdAt: -1 } },
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
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
        },
        'cover': { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
        'attachments': {
          $map: {
            input: '$attachments',
            as: 'att',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$att'] }
          }
        }
      }
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'creatives.creative',
        foreignField: '_id',
        as: 'creatives'
      }
    },
    {
      $addFields: {
        creatives: {
          $map: {
            input: '$creatives',
            as: 'creative',
            in: {
              _id: '$$creative._id',
              username: '$$creative.username',
              name: '$$creative.name',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$$creative.profileImage'] },
              isOnline: '$$creative.isOnline',
              acceptedProjectsCounter: '$$creative.acceptedProjectsCounter',
              rate: '$$creative.rate'
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
        'user': {
          $arrayElemAt: ['$userDetails', 0]
        }
      }
    },
    {
      $addFields: {
        'user.profileImage': { $concat: [process.env.BUCKET_HOST, '/', '$user.profileImage'] },
      }
    },
    {
      $project: {
        user: {
          _id: '$user._id',
          username: '$user.username',
          name: '$user.name',
          isOnline: '$user.isOnline',
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          rate: '$user.rate',
          profileImage: '$user.profileImage',
        },
        attachments: 1,
        cover: 1,
        title: 1,
        desc: 1,
        address: 1,
        tools: 1,
        searchKeywords: 1,
        creatives: 1,
        tags: 1,
        subCategory: 1,
        projectBudget: 1,
        category: 1,
        projectScale: 1,
        showOnHome: 1,
        cycle: 1,
        rate: 1
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

