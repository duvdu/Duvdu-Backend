import 'express-async-errors';
import { Message, MODELS, Contracts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { GetLoggedUserChatsHandler } from '../../types/endpoints/mesage.endpoints';


export const getUserChatsHandlerPagination: RequestHandler<unknown , unknown , unknown , {
  search?: string;
}> = async (req, res , next) => {

  // Store search term directly on request object for later use
  if (req.query.search) {
    req.pagination.filter.search = req.query.search;
  }

  next();
};

export const getLoggedUserChatsHandler: GetLoggedUserChatsHandler = async (req, res) => {
  const userId = new Types.ObjectId(req.loggedUser?.id);
  const searchTerm = req.pagination.filter.search;

  // First, let's get all conversations with their latest message using a simpler approach
  const conversationsAggregation: any[] = [
    // Match messages where user is sender or receiver
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }],
      },
    },
    // Sort by creation time descending (newest first)
    {
      $sort: { createdAt: -1 },
    },
    // Add field to identify the other user in conversation
    {
      $addFields: {
        otherUserId: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: '$receiver',
            else: '$sender',
          },
        },
      },
    },
    // Group by other user and get the first (newest) message
    {
      $group: {
        _id: '$otherUserId',
        latestMessage: { $first: '$$ROOT' },
        allMessages: { $push: '$$ROOT' },
      },
    },
    // Sort conversations by latest message time
    {
      $sort: { 'latestMessage.createdAt': -1 },
    },
    // Lookup sender details
    {
      $lookup: {
        from: MODELS.user,
        localField: 'latestMessage.sender',
        foreignField: '_id',
        as: 'senderInfo',
      },
    },
    // Lookup receiver details
    {
      $lookup: {
        from: MODELS.user,
        localField: 'latestMessage.receiver',
        foreignField: '_id',
        as: 'receiverInfo',
      },
    },
    // Project final structure
    {
      $project: {
        _id: '$_id', // This is the other user's ID
        latestMessageTime: '$latestMessage.createdAt',
        newestMessage: {
          _id: '$latestMessage._id',
          content: '$latestMessage.content',
          createdAt: '$latestMessage.createdAt',
          updatedAt: '$latestMessage.updatedAt',
          media: '$latestMessage.media',
          reactions: '$latestMessage.reactions',
          watchers: '$latestMessage.watchers',
          sender: {
            _id: { $arrayElemAt: ['$senderInfo._id', 0] },
            name: { $arrayElemAt: ['$senderInfo.name', 0] },
            username: { $arrayElemAt: ['$senderInfo.username', 0] },
            profileImage: {
              $cond: {
                if: { $arrayElemAt: ['$senderInfo.profileImage', 0] },
                then: {
                  $concat: [
                    process.env.BUCKET_HOST,
                    '/',
                    { $arrayElemAt: ['$senderInfo.profileImage', 0] },
                  ],
                },
                else: null,
              },
            },
            isOnline: { $arrayElemAt: ['$senderInfo.isOnline', 0] },
          },
          receiver: {
            _id: { $arrayElemAt: ['$receiverInfo._id', 0] },
            name: { $arrayElemAt: ['$receiverInfo.name', 0] },
            username: { $arrayElemAt: ['$receiverInfo.username', 0] },
            profileImage: {
              $cond: {
                if: { $arrayElemAt: ['$receiverInfo.profileImage', 0] },
                then: {
                  $concat: [
                    process.env.BUCKET_HOST,
                    '/',
                    { $arrayElemAt: ['$receiverInfo.profileImage', 0] },
                  ],
                },
                else: null,
              },
            },
            isOnline: { $arrayElemAt: ['$receiverInfo.isOnline', 0] },
          },
        },
        // Calculate unread message count
        unreadMessageCount: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'msg',
              cond: {
                $and: [
                  { $eq: ['$$msg.receiver', userId] },
                  {
                    $eq: [
                      {
                        $size: {
                          $filter: {
                            input: '$$msg.watchers',
                            as: 'watcher',
                            cond: {
                              $and: [
                                { $eq: ['$$watcher.user', userId] },
                                { $eq: ['$$watcher.watched', true] },
                              ],
                            },
                          },
                        },
                      },
                      0,
                    ],
                  },
                ],
              },
            },
          },
        },
        // Get other user details for search
        otherUserDetails: {
          $cond: {
            if: { $eq: ['$latestMessage.sender', userId] },
            then: {
              _id: { $arrayElemAt: ['$receiverInfo._id', 0] },
              name: { $arrayElemAt: ['$receiverInfo.name', 0] },
              username: { $arrayElemAt: ['$receiverInfo.username', 0] },
              email: { $arrayElemAt: ['$receiverInfo.email', 0] },
              about: { $arrayElemAt: ['$receiverInfo.about', 0] },
            },
            else: {
              _id: { $arrayElemAt: ['$senderInfo._id', 0] },
              name: { $arrayElemAt: ['$senderInfo.name', 0] },
              username: { $arrayElemAt: ['$senderInfo.username', 0] },
              email: { $arrayElemAt: ['$senderInfo.email', 0] },
              about: { $arrayElemAt: ['$senderInfo.about', 0] },
            },
          },
        },
      },
    },
  ];

  // Add search filter if search term exists
  if (searchTerm) {
    conversationsAggregation.push({
      $match: {
        $or: [
          { 'otherUserDetails.name': { $regex: searchTerm, $options: 'i' } },
          { 'otherUserDetails.username': { $regex: searchTerm, $options: 'i' } },
          { 'otherUserDetails.email': { $regex: searchTerm, $options: 'i' } },
          { 'otherUserDetails.about': { $regex: searchTerm, $options: 'i' } },
          { 'newestMessage.content': { $regex: searchTerm, $options: 'i' } },
        ],
      },
    });
  }

  // Add final sort to ensure consistent ordering by latest message time
  conversationsAggregation.push({
    $sort: { latestMessageTime: -1 },
  });

  // Get total count for pagination
  const countPipeline = [...conversationsAggregation, { $count: 'total' }];
  const totalResult = await Message.aggregate(countPipeline);
  const resultCount = totalResult.length > 0 ? totalResult[0].total : 0;

  // Add pagination
  conversationsAggregation.push(
    { $skip: req.pagination.skip },
    { $limit: req.pagination.limit },
    // Clean up projection - remove temporary fields
    {
      $project: {
        _id: 1,
        sender: '$newestMessage.sender._id',
        receiver: '$newestMessage.receiver._id',
        newestMessage: 1,
        unreadMessageCount: 1,
        otherUserDetails: 1,
      },
    },
  );

  const allChats = await Message.aggregate(conversationsAggregation);

  // Check if users can chat (contract validation)
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
