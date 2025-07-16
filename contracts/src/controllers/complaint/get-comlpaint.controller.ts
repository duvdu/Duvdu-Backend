import 'express-async-errors';
import { ContractReports, IcontractReport, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getComplaintHandler: RequestHandler<
  { id: string },
  SuccessResponse<{ data: IcontractReport }>
> = async (req, res, next) => {
  const complaints = await ContractReports.aggregate([
    {
      $match: { _id: new Types.ObjectId(req.params.id) },
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
      $unwind: '$reporter',
    },
    {
      $unwind: '$closedBy',
    },
    {
      $unwind: '$state.addedBy',
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
                  if: { $eq: ['$state.addedBy', null] },
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
                feedback: '$$state.feedback',
                createdAt: '$$state.createdAt',
                updatedAt: '$$state.updatedAt',
              },
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

  if (complaints.length === 0) return next(new NotFound(undefined, req.lang));

  res.status(200).json({ message: 'success', data: complaints[0] });
};
