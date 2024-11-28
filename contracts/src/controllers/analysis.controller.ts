import {
  CopyrightContracts,
  ProducerContract,
  ProjectContract,
  RentalContracts,
  SuccessResponse,
  TeamContract,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const contractAnalysis: RequestHandler<
  unknown,
  SuccessResponse<any>,
  unknown,
  {
    dateFrom?: string;
    dateTo?: string;
  }
> = async (req, res) => {
  const filter: any = { $match: {} };
  if (req.query.dateFrom || req.query.dateTo) {
    filter.$match.createdAt = {};
    if (req.query.dateFrom) {
      filter.$match.createdAt.$gte = new Date(req.query.dateFrom);
    }
    if (req.query.dateTo) {
      filter.$match.createdAt.$lte = new Date(req.query.dateTo);
    }
  }

  const copyrightContracts = await CopyrightContracts.aggregate([
    filter,
    {
      $facet: {
        totalPriceCount: [
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: '$totalPrice' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              statusCounts: {
                $push: {
                  k: '$_id',
                  v: '$count',
                },
              },
            },
          },
          {
            $addFields: {
              statusCounts: {
                $arrayToObject: {
                  $concatArrays: [
                    {
                      $map: {
                        input: [
                          'canceled',
                          'pending',
                          'waiting-for-pay-10',
                          'update-after-first-Payment',
                          'waiting-for-total-payment',
                          'ongoing',
                          'completed',
                          'rejected',
                          'complaint',
                        ],
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$statusCounts',
                                      cond: { $eq: ['$$this.k', '$$status'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              { v: 0 },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalPriceSum: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] }, 0] },
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalCount', 0] }, 0] },
        statusCounts: {
          $ifNull: [
            { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
            {
              canceled: 0,
              pending: 0,
              'waiting-for-pay-10': 0,
              'update-after-first-Payment': 0,
              'waiting-for-total-payment': 0,
              ongoing: 0,
              completed: 0,
              rejected: 0,
              complaint: 0,
            },
          ],
        },
      },
    },
  ]);

  const producerContracts = await ProducerContract.aggregate([
    filter,
    {
      $facet: {
        totalPriceCount: [
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: '$totalPrice' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              statusCounts: {
                $push: {
                  k: '$_id',
                  v: '$count',
                },
              },
            },
          },
          {
            $addFields: {
              statusCounts: {
                $arrayToObject: {
                  $concatArrays: [
                    {
                      $map: {
                        input: [
                          'canceled',
                          'pending',
                          'rejected',
                          'accepted',
                          'accepted with update',
                        ],
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$statusCounts',
                                      cond: { $eq: ['$$this.k', '$$status'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              { v: 0 },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalPriceSum: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] }, 0] },
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalCount', 0] }, 0] },
        statusCounts: {
          $ifNull: [
            { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
            {
              canceled: 0,
              pending: 0,
              rejected: 0,
              accepted: 0,
              'accepted with update': 0,
            },
          ],
        },
      },
    },
  ]);

  const projectContracts = await ProjectContract.aggregate([
    filter,
    {
      $facet: {
        totalPriceCount: [
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: '$totalPrice' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              statusCounts: {
                $push: {
                  k: '$_id',
                  v: '$count',
                },
              },
            },
          },
          {
            $addFields: {
              statusCounts: {
                $arrayToObject: {
                  $concatArrays: [
                    {
                      $map: {
                        input: [
                          'canceled',
                          'pending',
                          'waiting-for-pay-10',
                          'update-after-first-Payment',
                          'waiting-for-total-payment',
                          'ongoing',
                          'completed',
                          'rejected',
                        ],
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$statusCounts',
                                      cond: { $eq: ['$$this.k', '$$status'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              { v: 0 },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalPriceSum: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] }, 0] },
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalCount', 0] }, 0] },
        statusCounts: {
          $ifNull: [
            { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
            {
              canceled: 0,
              pending: 0,
              'waiting-for-pay-10': 0,
              'update-after-first-Payment': 0,
              'waiting-for-total-payment': 0,
              ongoing: 0,
              completed: 0,
              rejected: 0,
            },
          ],
        },
      },
    },
  ]);

  const rentalContracts = await RentalContracts.aggregate([
    filter,
    {
      $facet: {
        totalPriceCount: [
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: '$totalPrice' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              statusCounts: {
                $push: {
                  k: '$_id',
                  v: '$count',
                },
              },
            },
          },
          {
            $addFields: {
              statusCounts: {
                $arrayToObject: {
                  $concatArrays: [
                    {
                      $map: {
                        input: [
                          'canceled',
                          'pending',
                          'waiting-for-payment',
                          'ongoing',
                          'completed',
                          'rejected',
                          'complaint',
                        ],
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$statusCounts',
                                      cond: { $eq: ['$$this.k', '$$status'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              { v: 0 },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalPriceSum: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] }, 0] },
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalCount', 0] }, 0] },
        statusCounts: {
          $ifNull: [
            { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
            {
              canceled: 0,
              pending: 0,
              'waiting-for-payment': 0,
              ongoing: 0,
              completed: 0,
              rejected: 0,
              complaint: 0,
            },
          ],
        },
      },
    },
  ]);

  const teamContracts = await TeamContract.aggregate([
    {
      $facet: {
        totalPriceCount: [
          {
            $group: {
              _id: null,
              totalPriceSum: { $sum: '$totalPrice' },
              totalCount: { $sum: 1 },
            },
          },
        ],
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              statusCounts: {
                $push: {
                  k: '$_id',
                  v: '$count',
                },
              },
            },
          },
          {
            $addFields: {
              statusCounts: {
                $arrayToObject: {
                  $concatArrays: [
                    {
                      $map: {
                        input: [
                          'canceled',
                          'pending',
                          'waiting-for-total-payment',
                          'ongoing',
                          'completed',
                          'rejected',
                        ],
                        as: 'status',
                        in: {
                          k: '$$status',
                          v: {
                            $ifNull: [
                              {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$statusCounts',
                                      cond: { $eq: ['$$this.k', '$$status'] },
                                    },
                                  },
                                  0,
                                ],
                              },
                              { v: 0 },
                            ],
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalPriceSum: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] }, 0] },
        totalCount: { $ifNull: [{ $arrayElemAt: ['$totalPriceCount.totalCount', 0] }, 0] },
        statusCounts: {
          $ifNull: [
            { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
            {
              canceled: 0,
              pending: 0,
              'waiting-for-total-payment': 0,
              ongoing: 0,
              completed: 0,
              rejected: 0,
            },
          ],
        },
      },
    },
  ]);

  res.json({
    copyrightContract: copyrightContracts[0],
    producerContracts: producerContracts[0],
    projectContracts: projectContracts[0],
    rentalContracts: rentalContracts[0],
    teamContracts: teamContracts[0],
  });
};
