import 'express-async-errors';

import { Message } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { GetSpecificChatHandler } from '../../types/endpoints/mesage.endpoints';

export const getSpecificChatHandler: GetSpecificChatHandler = async (req, res) => {
  const userTwo = new Types.ObjectId(req.loggedUser.id);
  const userOne = new Types.ObjectId(req.params.receiver);


  const chat = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userOne, receiver: userTwo },
          { sender: userTwo, receiver: userOne },
        ],
      },
    },
    {
      $group: {
        _id: null,
        allMessages: { $push: '$$ROOT' },
      },
    },
    {
      $addFields: {
        unreadMessageCount: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'message',
              cond: {
                $and: [
                  { $eq: ['$$message.receiver', userTwo] },
                  { $eq: ['$$message.watched', false] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $unwind: '$allMessages',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'allMessages.sender',
        foreignField: '_id',
        as: 'senderDetails',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'allMessages.receiver',
        foreignField: '_id',
        as: 'receiverDetails',
      },
    },
    {
      $addFields: {
        'allMessages.sender': {
          $cond: [
            { $eq: [{ $size: '$senderDetails' }, 0] },
            null,
            { $arrayElemAt: ['$senderDetails', 0] },
          ],
        },
        'allMessages.receiver': {
          $cond: [
            { $eq: [{ $size: '$receiverDetails' }, 0] },
            null,
            { $arrayElemAt: ['$receiverDetails', 0] },
          ],
        },
      },
    },
    {
      $addFields: {
        'allMessages.sender': {
          $cond: [
            { $eq: ['$allMessages.sender', null] },
            null,
            {
              profileImage: {
                $ifNull: [
                  { $concat: [process.env.BUCKET_HOST, '/', '$allMessages.sender.profileImage'] },
                  null,
                ],
              },
              isOnline: { $ifNull: ['$allMessages.sender.isOnline', null] },
              username: { $ifNull: ['$allMessages.sender.username', null] },
              rank: { $ifNull: ['$allMessages.sender.rank', null] },
              projectsView: { $ifNull: ['$allMessages.sender.projectsView', null] },
              name: { $ifNull: ['$allMessages.sender.name', null] },
              _id: { $ifNull: ['$allMessages.sender._id', null] },
            },
          ],
        },
        'allMessages.receiver': {
          $cond: [
            { $eq: ['$allMessages.receiver', null] },
            null,
            {
              profileImage: {
                $ifNull: [
                  { $concat: [process.env.BUCKET_HOST, '/', '$allMessages.receiver.profileImage'] },
                  null,
                ],
              },
              isOnline: { $ifNull: ['$allMessages.receiver.isOnline', null] },
              username: { $ifNull: ['$allMessages.receiver.username', null] },
              rank: { $ifNull: ['$allMessages.receiver.rank', null] },
              projectsView: { $ifNull: ['$allMessages.receiver.projectsView', null] },
              name: { $ifNull: ['$allMessages.receiver.name', null] },
              _id: { $ifNull: ['$allMessages.receiver._id', null] },
            },
          ],
        },
        'allMessages.media': {
          $cond: {
            if: { $isArray: '$allMessages.media' },
            then: {
              $map: {
                input: '$allMessages.media',
                as: 'mediaItem',
                in: {
                  type: '$$mediaItem.type',
                  url: {
                    $ifNull: [
                      { $concat: [process.env.BUCKET_HOST, '/', '$$mediaItem.url'] },
                      null,
                    ],
                  },
                },
              },
            },
            else: [],
          },
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: { $mergeObjects: ['$allMessages', { unreadMessageCount: '$unreadMessageCount' }] },
      },
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
  ]);
  
  


  const resultCount = await Message.countDocuments({
    $or: [
      { sender: userOne, receiver: userTwo },
      { sender: userTwo, receiver: userOne },
    ],
  });

  await Message.updateMany({
    $or: [
      { sender: userOne, receiver: userTwo, watched: false },
      { sender: userTwo, receiver: userOne, watched: false },
    ],
  }, { $set: { watched: true } });

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: chat,
  });
};
