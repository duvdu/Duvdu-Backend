import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Message } from '../../models/message.model';
import { getUnreadMessageCounts } from '../../services/countUnReadMessage.service';
import { GetSpecificChatHandler } from '../../types/endpoints';


export const getSpecificChatHandler:GetSpecificChatHandler = async (req,res,next)=>{

  const chat = await Message.find({
    $or: [
      { sender: req.params.receiver, receiver: req.loggedUser.id },
      { sender: req.loggedUser.id, receiver: req.params.receiver }
    ]
  })
    .sort({ createdAt: -1 }).populate([
      {path:'sender' , select:'profileImage isOnline username name'},
      {path:'receiver' , select:'profileImage isOnline username name'},
      { path: 'reactions.user', select: 'profileImage isOnline username name' }
    ]).limit(req.pagination.limit).skip(req.pagination.skip);

  if (chat.length === 0)
    return next(new NotFound(`user dont have chat with this user ${req.params.receiver}`));

  const resultCount = await Message.countDocuments({
    $or: [
      { sender: req.params.receiver, receiver: req.loggedUser.id },
      { sender: req.loggedUser.id, receiver: req.params.receiver }
    ]
  });

  const unreadMessage = await getUnreadMessageCounts(req.loggedUser.id , req.params.receiver);

  res.status(200).json({
    message:'success' ,
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data:chat,
    unreadMessage
  });
};