import 'express-async-errors';
import { Message, MODELS, Contracts, Users, SystemRoles, Irole } from '@duvdu-v1/duvdu';
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

  // Build the main aggregation pipeline
  const mainPipeline: any[] = [
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
        // Add fields for easier search access
        otherUserDetails: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: {
              _id: { $ifNull: [{ $arrayElemAt: ['$receiverDetails._id', 0] }, null] },
              name: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.name', 0] }, null] },
              username: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.username', 0] }, null] },
              email: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.email', 0] }, null] },
              about: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.about', 0] }, null] },
            },
            else: {
              _id: { $ifNull: [{ $arrayElemAt: ['$senderDetails._id', 0] }, null] },
              name: { $ifNull: [{ $arrayElemAt: ['$senderDetails.name', 0] }, null] },
              username: { $ifNull: [{ $arrayElemAt: ['$senderDetails.username', 0] }, null] },
              email: { $ifNull: [{ $arrayElemAt: ['$senderDetails.email', 0] }, null] },
              about: { $ifNull: [{ $arrayElemAt: ['$senderDetails.about', 0] }, null] },
            },
          },
        },
      },
    },
  ];

  // Add search filter if search term exists
  if (searchTerm) {
    mainPipeline.push({
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

  // Add pagination
  mainPipeline.push(
    {
      $sort: {
        'newestMessage.createdAt': -1,
      },
    },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },

  );

  const allChats = await Message.aggregate(mainPipeline);

  // Count pipeline with search support
  const countPipeline: any[] = [
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
      },
    },
    {
      $match: {
        newestMessage: { $exists: true },
      },
    },
  ];

  // Add search functionality to count pipeline if needed
  if (searchTerm) {
    countPipeline.push(
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
          newestMessage: 1,
          otherUserDetails: {
            $cond: {
              if: { $eq: ['$newestMessage.sender', userId] },
              then: {
                name: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.name', 0] }, null] },
                username: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.username', 0] }, null] },
                email: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.email', 0] }, null] },
                about: { $ifNull: [{ $arrayElemAt: ['$receiverDetails.about', 0] }, null] },
              },
              else: {
                name: { $ifNull: [{ $arrayElemAt: ['$senderDetails.name', 0] }, null] },
                username: { $ifNull: [{ $arrayElemAt: ['$senderDetails.username', 0] }, null] },
                email: { $ifNull: [{ $arrayElemAt: ['$senderDetails.email', 0] }, null] },
                about: { $ifNull: [{ $arrayElemAt: ['$senderDetails.about', 0] }, null] },
              },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { 'otherUserDetails.name': { $regex: searchTerm, $options: 'i' } },
            { 'otherUserDetails.username': { $regex: searchTerm, $options: 'i' } },
            { 'otherUserDetails.email': { $regex: searchTerm, $options: 'i' } },
            { 'otherUserDetails.about': { $regex: searchTerm, $options: 'i' } },
            { 'newestMessage.content': { $regex: searchTerm, $options: 'i' } },
          ],
        },
      },
    );
  }

  countPipeline.push({
    $count: 'totalCount',
  });

  const totalCount = await Message.aggregate(countPipeline);
  const resultCount = totalCount.length > 0 ? totalCount[0].totalCount : 0;
  

  const chatsWithCanChat = await Promise.all(
    allChats.map(async (chat) => {
      // Get the receiver (other user) with populated role information
      const receiver = await Users.findById(chat._id).populate('role');
      
      // Check if receiver doesn't have verified or unverified role
      if (receiver && ![SystemRoles.verified, SystemRoles.unverified].includes((receiver.role as Irole).key as SystemRoles)) {
        return { ...chat, canChat: true };
      }
      
      // If receiver has verified or unverified role, apply current contract logic
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
