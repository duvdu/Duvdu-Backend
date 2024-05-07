import { PaginationResponse, CopyRights, IcopyRights, MODELS } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcopyRights[] }>
> = async (req, res) => {
  const resultCount = await CopyRights.countDocuments(req.pagination.filter);

  const projects = await CopyRights.aggregate([
    { $match: req.pagination.filter },
    { $sort: { createdAt: -1 } },
    { $limit: req.pagination.limit },
    { $skip: req.pagination.skip },
    {
      $addFields: {
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
        subCategory: {
          $cond: {
            if: { $eq: ['ar', req.lang] },
            then: '$subCategory.ar',
            else: '$subCategory.en'
          }
        }
      }
    },
    {
      $lookup: {
        from: MODELS.user, // Assuming your user collection is named 'users'
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $addFields: {
        user: {
          $cond: {
            if: { $eq: [{ $size: '$userDetails' }, 0] }, // Check if user not found
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
        _id: 1,
        user: {
          acceptedProjectsCounter: '$user.acceptedProjectsCounter',
          profileImage: '$user.profileImage',
          name: '$user.name',
          username: '$user.username',
          isOnline: '$user.isOnline'
        },
        category: 1,
        price: 1,
        duration: 1,
        address: 1,
        location: 1,
        searchKeywords: 1,
        showOnHome: 1,
        cycle: 1,
        rate: 1,
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

