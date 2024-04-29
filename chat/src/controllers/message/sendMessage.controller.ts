import 'express-async-errors';
import { SendMessageHandler } from '../../types/endpoints';



export const sendMessageHandler:SendMessageHandler = async (req,res,next)=>{
    console.log(true);
    
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  console.log(attachments);
    
};