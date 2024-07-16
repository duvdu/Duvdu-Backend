import { MODELS, Producer, ProducerContract, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { PipelineStage } from 'mongoose';



// Define the request handler for getting producer analysis
export const getProducerAnalysis: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>,
  unknown,
  { startDate?: Date; endDate?: Date }
> = async (req, res) => {
  const matchedPeriod: any = {};
  if (req.query.startDate || req.query.endDate) {
    matchedPeriod.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }

  const totalCount = await Producer.countDocuments(matchedPeriod);

  const topCategoriesPipeline: PipelineStage[] = [
    { $group: { _id: '$category', totalProducers: { $sum: 1 } } },
    {
      $lookup: {
        from: MODELS.category,
        localField: '_id',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $project: {
        _id: 1,
        totalProducers: 1,
        'categoryDetails.title': `$categoryDetails.title.${req.lang}`,
        'categoryDetails.subCategories': {
          $map: {
            input: '$categoryDetails.subCategories',
            as: 'subCategory',
            in: {
              title: `$$subCategory.title.${req.lang}`,
              tags: {
                $map: {
                  input: '$$subCategory.tags',
                  as: 'tag',
                  in: `$$tag.${req.lang}`
                }
              }
            }
          }
        },
        'categoryDetails.jobTitles': {
          $map: {
            input: '$categoryDetails.jobTitles',
            as: 'jobTitle',
            in: `$$jobTitle.${req.lang}`
          }
        }
      },
    },
    { $sort: { totalProducers: -1 } },
  ];
  if (matchedPeriod.createdAt) topCategoriesPipeline.unshift({ $match: matchedPeriod });
  const categoryStats = await Producer.aggregate(topCategoriesPipeline);


  const budgetStatsPipeline: PipelineStage[] = [
    { $group: { _id: '$user', totalMaxBudget: { $sum: '$maxBudget' } } },
    {
      $lookup: {
        from: MODELS.user,
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 1,
        totalMaxBudget: 1,
        'userDetails.username': 1,
        'userDetails.profileImage': { $concat: [process.env.BUCKET_HOST, '$userDetails.profileImage'] },
      },
    },
    { $sort: { totalMaxBudget: -1 } },
  ];
  if (matchedPeriod.createdAt) budgetStatsPipeline.unshift({ $match: matchedPeriod });

  const topMaxBudgetUsers = await Producer.aggregate([...budgetStatsPipeline, { $limit: 5 }]);

  const bottomMaxBudgetUsers = await Producer.aggregate([...budgetStatsPipeline, { $sort: { totalMaxBudget: 1 } }, { $limit: 5 }]);


  const keywordStatsPipeline: PipelineStage[] = [
    { $unwind: '$searchKeywords' },
    {
      $group: {
        _id: '$searchKeywords',
        users: { $addToSet: '$user' } 
      }
    },
    {
      $project: {
        _id: 1,
        userCount: { $size: '$users' }
      }
    },
    { $sort: { userCount: -1 } },
    { $limit: 5 },
  ];
  if (matchedPeriod.createdAt) keywordStatsPipeline.unshift({ $match: matchedPeriod });
  const keywordStats = await Producer.aggregate(keywordStatsPipeline);

  // const topProducersPipeline: PipelineStage[] = [
  //   { $match: matchedPeriod },
  //   { $group: { _id: '$producer', totalContracts: { $sum: 1 } } },
  //   {
  //     $lookup: {
  //       from: MODELS.producer,
  //       localField: '_id',
  //       foreignField: '_id',
  //       as: 'producerDetails',
  //     },
  //   },
  //   { $unwind: '$producerDetails' },
  //   {
  //     $lookup: {
  //       from: MODELS.user,
  //       localField: 'producerDetails.user',
  //       foreignField: '_id',
  //       as: 'producerDetails.user',
  //     },
  //   },
  //   { $unwind: '$producerDetails.user' },
  //   {
  //     $lookup: {
  //       from: MODELS.category,
  //       localField: 'producerDetails.category',
  //       foreignField: '_id',
  //       as: 'producerDetails.category',
  //     },
  //   },
  //   { $unwind: '$producerDetails.category' },
  //   {
  //     $project: {
  //       _id: 1,
  //       totalContracts: 1,
  //       'producerDetails.user.profileImage': { $concat: [process.env.BUCKET_HOST, 'producerDetails.user.profileImage'] },
  //       'producerDetails.user.username': 1,
  //       'producerDetails.category.title': `$producerDetails.category.title.${req.lang}`,
  //       'producerDetails.subCategories': {
  //         $map: {
  //           input: '$producerDetails.subCategories',
  //           as: 'subCategory',
  //           in: {
  //             title: `$$subCategory.title.${req.lang}`,
  //             tags: {
  //               $map: {
  //                 input: '$$subCategory.tags',
  //                 as: 'tag',
  //                 in: `$$tag.${req.lang}`
  //               }
  //             }
  //           }
  //         }
  //       },
  //       'producerDetails.maxBudget': 1,
  //       'producerDetails.minBudget': 1,
  //       'producerDetails.searchKeywords': 1,
  //     },
  //   },
  //   { $sort: { totalContracts: -1 } },
  //   { $limit: 10 },
  // ];
  // const topProducers = await ProducerContract.aggregate(topProducersPipeline);

  const topProducersPipeline: PipelineStage[] = [
    { $match: matchedPeriod },
    { $group: { _id: '$producer', totalContracts: { $sum: 1 } } },
    {
      $lookup: {
        from: MODELS.producer,
        localField: '_id',
        foreignField: '_id',
        as: 'producerDetails',
      },
    },
    { $unwind: '$producerDetails' },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'producerDetails.user',
        foreignField: '_id',
        as: 'producerDetails.user',
      },
    },
    { $unwind: '$producerDetails.user' },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'producerDetails.category',
        foreignField: '_id',
        as: 'producerDetails.category',
      },
    },
    { $unwind: '$producerDetails.category' },
    {
      $project: {
        _id: 1,
        totalContracts: 1,
        'producerDetails.user.profileImage': { $concat: [process.env.BUCKET_HOST, 'producerDetails.user.profileImage'] },
        'producerDetails.user.username': 1,
        'producerDetails.category.title': `$producerDetails.category.title.${req.lang}`,
        'producerDetails.subCategories': {
          $map: {
            input: '$producerDetails.subCategories',
            as: 'subCategory',
            in: {
              title: `$$subCategory.title.${req.lang}`,
              tags: {
                $map: {
                  input: '$$subCategory.tags',
                  as: 'tag',
                  in: `$$tag.${req.lang}`
                }
              }
            }
          }
        },
        'producerDetails.maxBudget': 1,
        'producerDetails.minBudget': 1,
        'producerDetails.searchKeywords': 1,
      },
    },
    { $sort: { totalContracts: -1 } },
    { $limit: 10 },
  ];

  // Additional stages to calculate contract counts based on status for each producer
  const statusCountsPipeline: PipelineStage[] = [
    { $match: matchedPeriod },
    { $group: { _id: '$producer', statusCounts: { $push: { status: '$status', count: 1 } } } },
    {
      $project: {
        _id: 1,
        statusCounts: {
          $arrayToObject: {
            $map: {
              input: '$statusCounts',
              as: 'statusCount',
              in: {
                k: '$$statusCount.status',
                v: '$$statusCount.count',
              },
            },
          },
        },
      },
    },
  ];

  const combinedPipeline = [
    { $facet: {
      topProducers: topProducersPipeline,
      statusCounts: statusCountsPipeline,
    },
    },
  ] as PipelineStage[];

  const [results] = await ProducerContract.aggregate(combinedPipeline);

  const topProducersWithStatus = results.topProducers.map((producer: any) => {
    const statusCounts = results.statusCounts.find((sc: any) => sc._id.equals(producer._id));
    return {
      ...producer,
      statusCounts: statusCounts ? statusCounts.statusCounts : {},
    };
  });

  res.status(200).json({
    message: 'success',
    data: {
      totalCount,
      categoryStats,
      bottomMaxBudgetUsers,
      topMaxBudgetUsers,
      keywordStats,
      topProducersWithStatus,
    },
  });
};
