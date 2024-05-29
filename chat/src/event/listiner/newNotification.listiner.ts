import { Subject , NewNotificationEvent , Lisener} from '@duvdu-v1/duvdu';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import { getSocketIOInstance } from '../..';
import { sendNotificationOrFCM } from '../../utils/sendNotificationOrFcm';



export class NewNotificationListener extends Lisener<NewNotificationEvent>{
  subject: Subject.newNotification = Subject.newNotification;
  queueGroupName: string = queueGroupName;
  async onMessage(data: NewNotificationEvent['data'], msg: Message) {
    console.log('receive new notification');
    
    const io = getSocketIOInstance();
    sendNotificationOrFCM(io , data.socketChannel , data.targetUser , data.notificationDetails, data.populatedNotification );  
    console.log('send ok from chat');
    
    msg.ack();
  }
}