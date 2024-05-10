import 'express-async-errors';

import { Message } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { GetSpecificChatHandler } from '../../types/endpoints/mesage.endpoints';



export const getSpecificChatHandler:GetSpecificChatHandler = async (req,res)=>{

  const userTwo = new Types.ObjectId(req.loggedUser.id);
  const userOne = new Types.ObjectId(req.params.receiver);

  const chat = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userOne, receiver: userTwo },
          { sender: userTwo, receiver: userOne }
        ]
      }
    },
    {
      $group: {
        _id: null,
        allMessages: { $push: '$$ROOT' }
      }
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
                  { $eq: ['$$message.watched', false] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $unwind: '$allMessages'
    },
    {
      $lookup: {
        from: 'users',
        localField: 'allMessages.sender',
        foreignField: '_id',
        as: 'senderDetails'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'allMessages.receiver',
        foreignField: '_id',
        as: 'receiverDetails'
      }
    },
    {
      $addFields: {
        'allMessages.sender': {
          $cond: [
            { $eq: [{ $size: '$senderDetails' }, 0] },
            null,
            { $arrayElemAt: ['$senderDetails', 0] }
          ]
        },
        'allMessages.receiver': {
          $cond: [
            { $eq: [{ $size: '$receiverDetails' }, 0] },
            null,
            { $arrayElemAt: ['$receiverDetails', 0] }
          ]
        }
      }
    },
    {
      $addFields: {
        'allMessages.sender': {
          $cond: [
            { $eq: ['$allMessages.sender', null] },
            null,
            {
              profileImage: {
                $concat: [process.env.BUCKET_HOST, '/', '$allMessages.sender.profileImage']
              },
              isOnline: '$allMessages.sender.isOnline',
              username: '$allMessages.sender.username',
              name: '$allMessages.sender.name',
              _id: '$allMessages.sender._id'
            }
          ]
        },
        'allMessages.receiver': {
          $cond: [
            { $eq: ['$allMessages.receiver', null] },
            null,
            {
              profileImage: {
                $concat: [process.env.BUCKET_HOST, '/', '$allMessages.receiver.profileImage']
              },
              isOnline: '$allMessages.receiver.isOnline',
              username: '$allMessages.receiver.username',
              name: '$allMessages.receiver.name',
              _id: '$allMessages.receiver._id'
            }
          ]
        }
      }
    },
    {
      $replaceRoot: { newRoot: { $mergeObjects: ['$allMessages', { unreadMessageCount: '$unreadMessageCount' }] } }
    },
    {
      $skip: req.pagination.skip
    },
    {
      $limit: req.pagination.limit
    }
  ]);
  
  

  const resultCount = await Message.countDocuments({
    $or: [
      { sender: userOne, receiver: userTwo },
      { sender: userTwo, receiver: userOne }
    ]
  });

  res.status(200).json({
    message:'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:chat
  });
};