import 'express-async-errors';
import { ContractReports, IcontractReport, MODELS, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
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
      $addFields: {
        stateUserIds: {
          $map: {
            input: {
              $cond: {
                if: { $and: [{ $ne: ['$state', null] }, { $isArray: '$state' }] },
                then: '$state',
                else: []
              }
            },
            as: 'stateItem',
            in: '$$stateItem.addedBy'
          }
        }
      }
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'stateUserIds',
        foreignField: '_id',
        as: 'stateUsers'
      }
    },
    {
      $unset: ['stateUserIds']
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
                else: []
              }
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
                else: []
              }
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
                                if: { $and: [{ $ne: ['$stateUsers', null] }, { $isArray: '$stateUsers' }] },
                                then: '$stateUsers',
                                else: []
                              }
                            },
                            cond: { $eq: ['$$this._id', '$$stateItem.addedBy'] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: {
                    $cond: {
                      if: { $ne: ['$$user', null] },
                      then: {
                        _id: '$$user._id',
                        name: '$$user.name',
                        username: '$$user.username',
                        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$$user.profileImage'] },
                        isOnline: '$$user.isOnline',
                      },
                      else: null
                    }
                  }
                }
              },
              feedback: '$$stateItem.feedback',
              createdAt: '$$stateItem.createdAt',
              updatedAt: '$$stateItem.updatedAt',
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
