import 'express-async-errors';
import { Message } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

import { GetLoggedUserChatsHandler } from '../../types/endpoints/mesage.endpoints';



export const getLoggedUserChatsHandler:GetLoggedUserChatsHandler = async (req,res)=>{

  const userId = new Types.ObjectId('65d46504d0e034a10a845d52');
  // const userId = new Types.ObjectId(req.loggedUser.id);
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
      $sort: {
        'messages.createdAt': -1
      }
    },
    {
      $skip: req.pagination.skip
    },
    {
      $limit: req.pagination.limit
    },
    {
      $facet: {
        chats: [
          { $skip: req.pagination.skip },
          { $limit: req.pagination.limit }
        ],
        unreadCounts: [
          {
            $project: {
              otherUser: '$_id',
              unreadCount: {
                $size: {
                  $filter: {
                    input: '$messages',
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
          }
        ]
      }
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