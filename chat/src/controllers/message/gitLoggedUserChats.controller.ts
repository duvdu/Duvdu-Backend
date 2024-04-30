import 'express-async-errors';
import { MODELS } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { Message } from '../../models/message.model';
import { GetLoggedUserChatsHandler } from '../../types/endpoints';



export const getLoggedUserChatsHandler:GetLoggedUserChatsHandler = async (req,res)=>{

  const userId = new Types.ObjectId('65d46504d0e034a10a845d52');
 
  const allChats = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      }
    },
    {
      $project: {
        otherUser: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: '$receiver',
            else: '$sender'
          }
        },
        message: '$$ROOT'
      }
    },
    {
      $group: {
        _id: '$otherUser',
        messages: { $push: '$message' }
      }
    },
    {
      $match: {
        messages: { $ne: null }
      }
    },
    {
      $unwind: '$messages'
    },
    {
      $sort: {
        'messages.createdAt': -1
      }
    },
    {
      $group: {
        _id: '$_id',
        newestMessage: { $first: '$messages' },
        allMessages: { $push: '$messages' } 
      }
    },
    {
      $lookup: {
        from: MODELS.user, 
        localField: 'newestMessage.sender',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $project: {
        _id: 1,
        newestMessage: {
          $mergeObjects: [
            '$newestMessage',
            {
              sender: {
                $cond: [
                  { $eq: [{ $size: '$sender' }, 0] },
                  null,
                  {
                    $let: {
                      vars: {
                        senderDoc: { $arrayElemAt: ['$sender', 0] }
                      },
                      in: {
                        profileImage: '$$senderDoc.profileImage',
                        isOnline: '$$senderDoc.isOnline',
                        username: '$$senderDoc.username',
                        name: '$$senderDoc.name'
                      }
                    }
                  }
                ]
              }
            }
          ]
        },
        unreadMessageCount: {
          $size: {
            $filter: {
              input: '$allMessages',
              as: 'message',
              cond: {
                $and: [
                  { $eq: ['$$message.receiver', userId] },
                  { $eq: ['$$message.watched', false] }
                ]
              }
            }
          }
        }
      }
    },
    {
      $skip: req.pagination.skip
    },
    {
      $limit: req.pagination.limit
    }
  ]);
  
  

  const countPipeline = [
    {
      $match: {
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      }
    },
    {
      $project: {
        otherUser: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: '$receiver',
            else: '$sender'
          }
        }
      }
    },
    {
      $group: {
        _id: '$otherUser'
      }
    },
    {
      $count: 'totalCount'
    }
  ];
  
  const totalCount = await Message.aggregate(countPipeline);
  const resultCount = totalCount.length > 0 ? totalCount[0].totalCount : 0;
  res.status(200).json({
    message:'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:allChats
  });
};