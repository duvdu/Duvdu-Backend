import { Subject } from './subject';
import { Inotification } from '../models/notification.model';


export interface TicketCreatedEvent{
    subject: Subject.newNotification;
    data: {
        targetUser:string,
        notificationDetails: { title: string; message: string },
        populatedNotification: Inotification,
        socketChannel: string,
    },
}