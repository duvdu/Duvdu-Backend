import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const contractAnalysis: RequestHandler = async (req, res) => {
  const copyrightContracts = await mongoose.connection.db
    .collection('copyright_contracts')
    .aggregate([
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
          totalPriceSum: { $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] },
          totalCount: { $arrayElemAt: ['$totalPriceCount.totalCount', 0] },
          statusCounts: { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
        },
      },
    ])
    .toArray();

  const producerContracts = await mongoose.connection.db
    .collection('producer-contracts')
    .aggregate([
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
          totalPriceSum: { $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] },
          totalCount: { $arrayElemAt: ['$totalPriceCount.totalCount', 0] },
          statusCounts: { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
        },
      },
    ])
    .toArray();

  const projectContracts = await mongoose.connection.db
    .collection('project_contracts')
    .aggregate([
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
          totalPriceSum: { $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] },
          totalCount: { $arrayElemAt: ['$totalPriceCount.totalCount', 0] },
          statusCounts: { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
        },
      },
    ])
    .toArray();

  const rentalContracts = await mongoose.connection.db
    .collection('rental_contracts')
    .aggregate([
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
                            'complaint'
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
          totalPriceSum: { $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] },
          totalCount: { $arrayElemAt: ['$totalPriceCount.totalCount', 0] },
          statusCounts: { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
        },
      },
    ])
    .toArray();

  const teamContracts = await mongoose.connection.db
    .collection('team_contracts')
    .aggregate([
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
          totalPriceSum: { $arrayElemAt: ['$totalPriceCount.totalPriceSum', 0] },
          totalCount: { $arrayElemAt: ['$totalPriceCount.totalCount', 0] },
          statusCounts: { $arrayElemAt: ['$statusCounts.statusCounts', 0] },
        },
      },
    ])
    .toArray();

  res.json({
    copyrightContract: copyrightContracts[0],
    producerContracts: producerContracts[0],
    projectContracts: projectContracts[0],
    rentalContracts: rentalContracts[0],
    teamContracts: teamContracts[0],
  });
};
