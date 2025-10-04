import { ContractReports, IcontractReport, MODELS, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getComplaintsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    addedBy?: string;
    isClosed?: boolean;
    closedBy?: string;
    reporter?: string;
    contract?: string;
    startDate?: string;
    endDate?: string;
    ticketNumber?: string;
  }
> = async (req, res, next) => {
  req.pagination.filter = {};
  if (req.query.search) {
    req.pagination.filter.$or = [
      { 'state.feedback': { $regex: req.query.search, $options: 'i' } },
      { ticketNumber: { $regex: req.query.search, $options: 'i' } },
      { desc: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.ticketNumber) req.pagination.filter.ticketNumber = req.query.ticketNumber;
  if (req.query.addedBy)
    req.pagination.filter['state.addedBy'] = new Types.ObjectId(req.query.addedBy);

  if (req.query.closedBy) req.pagination.filter.closedBy = new Types.ObjectId(req.query.closedBy);

  if (req.query.reporter) req.pagination.filter.reporter = new Types.ObjectId(req.query.reporter);

  if (req.query.contract) req.pagination.filter.contract = new Types.ObjectId(req.query.contract);

  if (req.query.startDate || req.query.endDate) {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // If start and end dates are the same, filter for the entire day
    if (
      req.query.startDate &&
      req.query.endDate &&
      new Date(req.query.startDate).toDateString() === new Date(req.query.endDate).toDateString()
    ) {
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(startDate);
      dayEnd.setHours(23, 59, 59, 999);

      req.pagination.filter.createdAt = {
        $gte: dayStart,
        $lte: dayEnd,
      };
    } else {
      // For different dates or single date filters
      const filterEndDate = new Date(endDate);
      // Include the entire end date by setting time to end of day
      if (req.query.endDate) {
        filterEndDate.setHours(23, 59, 59, 999);
      }

      req.pagination.filter.createdAt = {
        $gte: startDate,
        $lte: filterEndDate,
      };
    }
  }
  if (req.query.isClosed !== undefined) {
    if (req.query.isClosed === true) {
      req.pagination.filter.isClosed = true;
    } else {
      req.pagination.filter.$or = [
        { isClosed: false },
        { isClosed: { $exists: false } },
        { isClosed: null },
      ];
    }
  }

  next();
};

export const getComplaintsHandler: RequestHandler<
  unknown,
  PaginationResponse<{ data: IcontractReport[] }>
> = async (req, res) => {
  const resultCount = await ContractReports.countDocuments(req.pagination.filter);

  const complaints = await ContractReports.aggregate([
    {
      $match: req.pagination.filter,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'reporter',
        foreignField: '_id',
        as: 'reporter',
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'closedBy',
        foreignField: '_id',
        as: 'closedBy',
      },
    },
    {
      $unwind: {
        path: '$reporter',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$closedBy',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        stateUserIds: {
          $map: {
            input: {
              $cond: {
                if: { $and: [{ $ne: ['$state', null] }, { $isArray: '$state' }] },
                then: '$state',
                else: [],
              },
            },
            as: 'stateItem',
            in: '$$stateItem.addedBy',
          },
        },
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'stateUserIds',
        foreignField: '_id',
        as: 'stateUsers',
      },
    },
    {
      $unset: ['stateUserIds'],
    },
    {
      $project: {
        _id: 1,
        contract: 1,
        ticketNumber: 1,

        reporter: {
          $cond: {
            if: { $eq: ['$reporter', null] },
            then: null,
            else: {
              _id: '$reporter._id',
              name: '$reporter.name',
              username: '$reporter.username',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$reporter.profileImage'] },
              isOnline: '$reporter.isOnline',
            },
          },
        },
        attachments: {
          $map: {
            input: {
              $cond: {
                if: { $and: [{ $ne: ['$attachments', null] }, { $isArray: '$attachments' }] },
                then: '$attachments',
                else: [],
              },
            },
            as: 'attachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
          },
        },
        state: {
          $map: {
            input: {
              $cond: {
                if: { $and: [{ $ne: ['$state', null] }, { $isArray: '$state' }] },
                then: '$state',
                else: [],
              },
            },
            as: 'stateItem',
            in: {
              addedBy: {
                $let: {
                  vars: {
                    user: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: {
                              $cond: {
                                if: {
                                  $and: [
                                    { $ne: ['$stateUsers', null] },
                                    { $isArray: '$stateUsers' },
                                  ],
                                },
                                then: '$stateUsers',
                                else: [],
                              },
                            },
                            cond: {
                              $eq: [
                                { $toString: '$$this._id' },
                                { $toString: '$$stateItem.addedBy' },
                              ],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$user', null] },
                      then: {
                        _id: '$$user._id',
                        name: '$$user.name',
                        username: '$$user.username',
                        profileImage: {
                          $cond: {
                            if: {
                              $and: [
                                { $ne: ['$$user.profileImage', null] },
                                { $ne: ['$$user.profileImage', ''] },
                              ],
                            },
                            then: {
                              $concat: [process.env.BUCKET_HOST, '/', '$$user.profileImage'],
                            },
                            else: null,
                          },
                        },
                        isOnline: '$$user.isOnline',
                      },
                      else: null,
                    },
                  },
                },
              },
              feedback: '$$stateItem.feedback',
              isSystem: '$$stateItem.isSystem',
            },
          },
        },
        isClosed: 1,
        desc: 1,
        createdAt: 1,
        updatedAt: 1,
        closedBy: {
          $cond: {
            if: { $eq: ['$isClosed', true] },
            then: {
              _id: '$closedBy._id',
              name: '$closedBy.name',
              username: '$closedBy.username',
              profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$closedBy.profileImage'] },
              isOnline: '$closedBy.isOnline',
            },
            else: null,
          },
        },
      },
    },
  ]);

  // Send response with paginated data and metadata
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: complaints,
  });
};
