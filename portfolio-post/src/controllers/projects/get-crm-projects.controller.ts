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
        },
        cover: { $concat: [process.env.BUCKET_HOST + '/', '$cover'] },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: { $concat: [process.env.BUCKET_HOST + '/', '$$attachment'] }
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
      $addFields: {
        'user.profileImage': {
          $concat: [
            process.env.BUCKET_HOST + '/',
            '$user.profileImage'
          ]
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
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          rate: '$user.rate'
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

