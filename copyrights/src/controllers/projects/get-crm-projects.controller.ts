import { PaginationResponse, CopyRights, IcopyRights } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getCrmProjectsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcopyRights[] }>
> = async (req, res) => {
  const resultCount = await CopyRights.countDocuments(req.pagination.filter);

  const projects = await CopyRights.aggregate([
    { $match: req.pagination.filter },
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
