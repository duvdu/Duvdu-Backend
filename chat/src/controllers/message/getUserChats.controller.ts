import 'express-async-errors';
import { Message, MODELS, Contracts, PaginationResponse, ImessageDoc } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

export const getUserChatsHandler: RequestHandler<
  { userId: string },
  PaginationResponse<{ data: ImessageDoc[][] }>,
  unknown,
  { limit?: number; page?: number }
> = async (req, res) => {
  const userId = new Types.ObjectId(req.params.userId);

  // Get all chats ordered by newest message first
  const allChats = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    {
      // Sort all messages by creation time (newest first)
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        sender: 1,
        receiver: 1,
        createdAt: 1, // Include createdAt for explicit sorting
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
        newestMessage: { $first: '$message' }, // Gets the newest message due to sort above
        allMessages: { $push: '$message' },
        latestCreatedAt: { $first: '$createdAt' }, // Capture the latest timestamp explicitly
      },
    },
    {
      $match: {
        newestMessage: { $exists: true },
      },
    },
    {
      // Sort conversations by latest message timestamp (newest conversations first)
      $sort: {
        latestCreatedAt: -1,
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
                  { $eq: ['$$message.receiver', userId] },
                  {
                    $in: [
                      false,
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$$message.watchers',
                              as: 'watcher',
                              cond: { $eq: ['$$watcher.user', userId] },
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
      // Final pagination after all processing
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    {
      // Final sort to guarantee newest messages first in paginated results
      $sort: {
        'newestMessage.createdAt': -1,
      },
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

  const chatsWithCanChat = await Promise.all(
    allChats.map(async (chat) => {
      const canChat = !!(await Contracts.findOne({
        $or: [
          { sp: req.loggedUser?.id, customer: chat._id },
          { customer: req.loggedUser?.id, sp: chat._id },
        ],
      }).populate({
        path: 'contract',
        match: {
          status: { $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'] },
        },
      }));

      return { ...chat, canChat };
    }),
  );

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: chatsWithCanChat,
  });
};
