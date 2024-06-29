import { Publisher , Subject, TopicNotificationEvent } from '@duvdu-v1/duvdu';



export class TopicNotificationPublisher extends Publisher<TopicNotificationEvent>{
  subject: Subject.topicNotification = Subject.topicNotification;
}