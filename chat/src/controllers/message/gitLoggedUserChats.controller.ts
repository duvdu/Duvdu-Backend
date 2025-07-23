import 'express-async-errors';
import { Message, MODELS, Contracts, Users } from '@duvdu-v1/duvdu';
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
        _id: '$latestMessage._id', // Use the message ID as the main ID
        latestMessageTime: '$latestMessage.createdAt',
        // Flatten all message fields to top level
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
          rank: { $arrayElemAt: ['$senderInfo.rank', 0] },
          projectsView: { $arrayElemAt: ['$senderInfo.projectsView', 0] },
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
          rank: { $arrayElemAt: ['$receiverInfo.rank', 0] },
          projectsView: { $arrayElemAt: ['$receiverInfo.projectsView', 0] },
        },
        content: '$latestMessage.content',
        watchers: '$latestMessage.watchers',
        updated: '$latestMessage.updated',
        reactions: '$latestMessage.reactions',
        media: '$latestMessage.media',
        createdAt: '$latestMessage.createdAt',
        updatedAt: '$latestMessage.updatedAt',
        __v: '$latestMessage.__v',
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
          { 'content': { $regex: searchTerm, $options: 'i' } },
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
        sender: 1,
        receiver: 1,
        content: 1,
        watchers: 1,
        updated: 1,
        reactions: 1,
        media: 1,
        createdAt: 1,
        updatedAt: 1,
        __v: 1,
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

  // Get logged-in user details
  const loggedUserDetails = await Users.findOne({ _id: userId });

  const user = loggedUserDetails ? {
    _id: loggedUserDetails._id,
    name: loggedUserDetails.name,
    username: loggedUserDetails.username,
    profileImage: loggedUserDetails.profileImage ? `${process.env.BUCKET_HOST}/${loggedUserDetails.profileImage}` : null,
    isOnline: loggedUserDetails.isOnline,
    rank: loggedUserDetails.rank,
    projectsView: loggedUserDetails.projectsView,
    canChat: false, // Default value as shown in the example
  } : null;

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: chatsWithCanChat,
    user,
  } as any);
};
