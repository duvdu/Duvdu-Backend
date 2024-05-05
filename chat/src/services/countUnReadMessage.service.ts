import { Message } from '@duvdu-v1/duvdu';
import { Types } from 'mongoose';

export interface UnreadMessageCount {
  _id: string;
  count: number; 
}

export async function getUnreadMessageCounts(receiverId1:string, receiverId2:string):Promise<UnreadMessageCount[]> {

  const userOne = new Types.ObjectId(receiverId1);
  const userTwo = new Types.ObjectId(receiverId2);
  try {
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: userOne, receiver: userTwo },
            { sender: userTwo, receiver: userOne }
          ],
          watched: false
        }
      },
      {
        $group: {
          _id: '$sender',
          count: { $sum: 1 }
        }
      }
    ]).exec();
    return unreadCounts;
  } catch (error) {
    console.error('Error counting unread messages:', error);
    throw error;
  }
}
