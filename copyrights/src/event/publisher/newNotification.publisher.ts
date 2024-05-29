import { Publisher , NewNotificationEvent, Subject } from '@duvdu-v1/duvdu';



export class NewNotificationPublisher extends Publisher<NewNotificationEvent>{
  subject: Subject.newNotification = Subject.newNotification;
}