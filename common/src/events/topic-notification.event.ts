import { Subject } from './subject';

export interface TopicNotificationEvent {
  subject: Subject.topicNotification;
  data: {
    topic: string;
    title: string;
    message: string;
  };
}
