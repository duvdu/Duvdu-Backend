import { Subject, InotificationEvent, Lisener, Channels } from '@duvdu-v1/duvdu';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import { getSocketIOInstance } from '../..';

export class NotificationListener extends Lisener<InotificationEvent> {
  subject: Subject.notification = Subject.notification;
  queueGroupName: string = queueGroupName;
  async onMessage(data: InotificationEvent['data'], msg: Message) {
    const io = await getSocketIOInstance();
    io.to(data.targetUsers).emit(Channels.notification, data.notificationDetails);

    msg.ack();
  }
}
