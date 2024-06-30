import { Publisher, InotificationEvent, Subject } from '@duvdu-v1/duvdu';

export class NotificationPublisher extends Publisher<InotificationEvent> {
  subject: Subject.notification = Subject.notification;
}
