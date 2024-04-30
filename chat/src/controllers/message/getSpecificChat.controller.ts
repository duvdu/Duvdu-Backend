import 'express-async-errors';

import { Types } from 'mongoose';

import { Message } from '../../models/message.model';
import { GetSpecificChatHandler } from '../../types/endpoints';


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
        as: 'sender'
      }
    },
    {
      $addFields: {
        'allMessages.sender': {
          $cond: [
            { $eq: [{ $size: '$sender' }, 0] },
            null,
            { $arrayElemAt: ['$sender', 0] }
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
              profileImage: '$allMessages.sender.profileImage',
              isOnline: '$allMessages.sender.isOnline',
              username: '$allMessages.sender.username',
              name: '$allMessages.sender.name',
              _id: '$allMessages.sender._id'
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