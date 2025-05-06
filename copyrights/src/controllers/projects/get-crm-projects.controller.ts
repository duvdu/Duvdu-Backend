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
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
    {
      $addFields: {
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              _id: '$$tag._id',
              title: {
                $cond: {
                  if: { $eq: ['ar', req.lang] },
                  then: '$$tag.ar',
                  else: '$$tag.en',
                },
              },
            },
          },
        },
        subCategory: {
          title: `$subCategory.${req.lang}`,
          _id: '$subCategory._id',
        },
      },
    },
    {
      $lookup: {
        from: MODELS.user, // Assuming your user collection is named 'users'
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $project: {
        _id: 1,
        user: {
          $cond: {
            if: { $eq: [{ $size: '$userDetails' }, 0] }, // Check if user not found
            then: null,
            else: {
              acceptedProjectsCounter: { $arrayElemAt: ['$userDetails.acceptedProjectsCounter', 0] },
              profileImage: {
                $cond: {
                  if: { $isArray: { $arrayElemAt: ["$userDetails.profileImage", 0] } },
                  then: { $concat: [process.env.BUCKET_HOST, "/", { $arrayElemAt: [{ $arrayElemAt: ["$userDetails.profileImage", 0] }, 0] }] },
                  else: { $concat: [process.env.BUCKET_HOST, "/", { $arrayElemAt: ["$userDetails.profileImage", 0] }] }
                }
              },
              name: { $arrayElemAt: ['$userDetails.name', 0] },
              username: { $arrayElemAt: ['$userDetails.username', 0] },
              isOnline: { $arrayElemAt: ['$userDetails.isOnline', 0] },
              rank: { $arrayElemAt: ['$userDetails.rank', 0] },
              projectsView: { $arrayElemAt: ['$userDetails.projectsView', 0] },
              rate: { $arrayElemAt: ['$userDetails.rate', 0] },
            },
          },
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
        subCategory: 1,
      },
    },
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
