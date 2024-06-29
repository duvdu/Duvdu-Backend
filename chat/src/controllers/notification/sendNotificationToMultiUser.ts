import 'express-async-errors';



import { BadRequestError, Users } from '@duvdu-v1/duvdu';

import { SendNotificationMultiUserHandler } from '../../types/endpoints/notification.endpoint';
import { sendFcmToMultipleUsers } from '../../utils/sendFcmToMultiUser';



export const sendNotificationToMultiUserHandler:SendNotificationMultiUserHandler = async (req,res,next)=>{
  try {
    const users = await Users.find({ _id: { $in: req.body.users } }).select('notificationToken');

    if (users.length !== req.body.users.length) 
      return next(new BadRequestError({en:'invalid users' , ar:'مستخدمين غير صالحين'} , req.lang));
    
    const notificationTokens = users.map(user => user.notificationToken).filter(token => token !== null);
    
    if (notificationTokens.length > 0) 
      await sendFcmToMultipleUsers(notificationTokens , req.body.title , req.body.message);
  
    res.status(200).json({message:'success'});
  } catch (error) {
    res.status(500).json(<any>{message:'failed to send fcm notification'});
  }
};