import 'express-async-errors';
import { Message, NotFound } from '@duvdu-v1/duvdu';

import { GetChatFromUserToUserHandler } from '../../types/endpoints/mesage.endpoints';



export const getChatFromToHandler:GetChatFromUserToUserHandler = async (req ,res ,next)=>{

  req.pagination.filter = {};
  req.pagination.filter.$or = [
    { sender: req.params.receiver, receiver: req.params.sender },
    { sender: req.params.sender, receiver: req.params.receiver }
  ];
  
  if (req.query.fromDate || req.query.toDate) {
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : new Date(0);
    const toDate = req.query.toDate ? new Date(req.query.toDate) : new Date();
  
    req.pagination.filter.createdAt = {
      $gte: fromDate,
      $lte: toDate,
    };
  }

  const chat = await Message.find(req.pagination.filter).sort({createdAt:-1}).populate([
    {path:'sender' , select:'profileImage isOnline username name'},
    {path:'receiver' , select:'profileImage isOnline username name'},
    { path: 'reactions.user', select: 'profileImage isOnline username name' }
  ]).skip(req.pagination.skip).limit(req.pagination.limit);

  if (chat.length === 0) 
    return next(new NotFound(undefined , req.lang));
  
  const resultCount = await Message.countDocuments(req.pagination.filter);

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