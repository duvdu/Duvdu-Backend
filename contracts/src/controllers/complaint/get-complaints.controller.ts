import { ContractReports, IcontractReport, PaginationResponse } from '@duvdu-v1/duvdu';
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
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  if (req.query.isClosed !== undefined) {
    req.pagination.filter.isClosed = req.query.isClosed;
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
        from: 'users',
        localField: 'reporter',
        foreignField: '_id',
        as: 'reporter',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'closedBy',
        foreignField: '_id',
        as: 'closedBy',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'state.addedBy',
        foreignField: '_id',
        as: 'state.addedBy',
      },
    },
    {
      $unwind: {
        path: '$reporter',
        preserveNullAndEmptyArrays: true
      },
    },
    {
      $unwind: {
        path: '$closedBy',
        preserveNullAndEmptyArrays: true
      },
    },
    {
      $unwind: {
        path: '$state.addedBy',
        preserveNullAndEmptyArrays: true
      },
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
            input: '$attachments',
            as: 'attachment',
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
          },
        },
        state: {
          $map: {
            input: '$state',
            as: 'state',
            in: {
              addedBy: {
                $cond: {
                  if: { $eq: ['$$state.addedBy', null] },
                  then: null,
                  else: {
                    _id: '$$state.addedBy._id',
                    name: '$$state.addedBy.name',
                    username: '$$state.addedBy.username',
                    profileImage: {
                      $concat: [process.env.BUCKET_HOST, '/', '$$state.addedBy.profileImage'],
                    },
                    isOnline: '$$state.addedBy.isOnline',
                  },
                },
              },
              feedback: '$$state.feedback',
              createdAt: '$$state.createdAt',
              updatedAt: '$$state.updatedAt',
            },
          },
        },
        isClosed: 1,
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
