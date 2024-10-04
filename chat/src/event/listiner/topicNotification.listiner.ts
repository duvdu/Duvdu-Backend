import { Subject, Lisener, TopicNotificationEvent } from '@duvdu-v1/duvdu';
import { Message } from 'node-nats-streaming';

import { queueGroupName } from './queueGroupName';
import { sendFcmToSpecificTopic } from '../../utils/sendFcmForSpecificTopic';

export class TopicNotificationListener extends Lisener<TopicNotificationEvent> {
  subject: Subject.topicNotification = Subject.topicNotification;
  queueGroupName: string = queueGroupName;
  async onMessage(data: TopicNotificationEvent['data'], msg: Message) {
    console.log('receive new notification');
    await sendFcmToSpecificTopic(data.topic, data.title, data.message);

    console.log('success send to topic');
    msg.ack();
  }
}
