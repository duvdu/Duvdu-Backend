import { Subject } from './subject';

export interface InotificationEvent {
  subject: Subject.notification;
  data: {
    targetUsers: string[];
    notificationDetails: { title: string; message: string };
  };
}
