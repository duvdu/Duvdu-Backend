import { Publisher, Subject, NewNotificationEvent } from '@duvdu-v1/duvdu';

export class NotificationPublisher extends Publisher<NewNotificationEvent> {
  subject: Subject.newNotification = Subject.newNotification;
}
