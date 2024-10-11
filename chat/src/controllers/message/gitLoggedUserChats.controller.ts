import 'express-async-errors';
import { Message, MODELS } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { GetLoggedUserChatsHandler } from '../../types/endpoints/mesage.endpoints';

export const getLoggedUserChatsHandler: GetLoggedUserChatsHandler = async (req, res) => {
  const userId = new Types.ObjectId(req.loggedUser?.id);

  const allChats = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        sender: 1,
        receiver: 1,
        otherUser: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: '$receiver',
            else: '$sender',
          },
        },
        message: '$$ROOT',
      },
    },
    {
      $group: {
        _id: '$otherUser',
        newestMessage: { $first: '$message' },
        allMessages: { $push: '$message' },
      },
    },
    {
      $match: {
        newestMessage: { $exists: true },
      },
    },
    {
      $sort: {
        'newestMessage.createdAt': -1,
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'newestMessage.sender',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $lookup: {
        from: MODELS.user,
        localField: 'newestMessage.receiver',
        foreignField: '_id',
        as: 'receiverDetails',
      },
    },
    {
      $project: {
        _id: 1,
        sender: '$newestMessage.sender',
        receiver: '$newestMessage.receiver',
        newestMessage: {
          $mergeObjects: [
            '$newestMessage',
            {
              sender: {
                _id: { $ifNull: [{ $arrayElemAt: ['$senderDetails._id', 0] }, null] },
                profileImage: {
                  $ifNull: [
                    {
                      $concat: [
                        process.env.BUCKET_HOST,
                        '/',
                        { $arrayElemAt: ['$senderDetails.profileImage', 0] },
                      ],
                    },
                    null,
                  ],
                },
                isOnline: { $ifNull: [{ $arrayElemAt: ['$senderDetails.isOnline', 0] }, null] },
                username: { $ifNull: [{ $arrayElemAt: ['$senderDetails.username', 0] }, null] },
                name: { $ifNull: [{ $arrayElemAt: ['$senderDetails.name', 0] }, null] },
              },
              receiver: {
                _id: { $ifNull: [{ $arrayElemAt: ['$receiverDetails._id', 0] }, null] },
                profileImage: {
                  $ifNull: [
                    {
                      $concat: [
                        process.env.BUCKET_HOST,
                        '/',
                        { $arrayElemAt: ['$receiverDetails.profileImage', 0] },
                      ],
                    },
                    null,
                  ],
                },
                isOnline: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.isOnline', 0] }, null] },
                username: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.username', 0] }, null] },
                name: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.name', 0] }, null] },
              },
            },
          ],
        },
        unreadMessageCount: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'message',
              cond: {
                $and: [
                  { $eq: ['$$message.receiver', req.loggedUser.id] },
                  {
                    $in: [
                      false,
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$$message.watchers',
                              as: 'watcher',
                              cond: { $eq: ['$$watcher.user', req.loggedUser.id] },
                            },
                          },
                          as: 'watcher',
                          in: '$$watcher.watched',
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
  ]);

  const countPipeline = [
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      $project: {
        otherUser: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: '$receiver',
            else: '$sender',
          },
        },
      },
    },
    {
      $group: {
        _id: '$otherUser',
      },
    },
    {
      $count: 'totalCount',
    },
  ];

  const totalCount = await Message.aggregate(countPipeline);
  const resultCount = totalCount.length > 0 ? totalCount[0].totalCount : 0;
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: allChats,
  });
};
