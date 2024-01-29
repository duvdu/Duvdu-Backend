import { RequestHandler } from 'express';
import { Imessage } from './Message';
import { Iuser } from './User';
type successResponse<T> = T & {
  message: 'success';
};

// emit event (new_message) to the target user
export interface SendMessageHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Imessage, 'targetUser' | 'message' | 'attachment'>,
    unknown
  > {}

// get all messages with between two users ordered by createdAt
// update all messages to be watched and noticed
// message_watched fired to every message updated to watched
export interface GetMessagesHandler
  extends RequestHandler<
    { targetUser: string },
    successResponse<{
      data: Imessage[];
    }>,
    unknown,
    { limit: number; page: number; skip: number }
  > {}

export interface GetChatsHandler
  extends RequestHandler<
    unknown,
    successResponse<{ targetUser: Iuser & { lastMessage: string; messageCounter: number }[] }>,
    unknown,
    { limit: number; page: number; skip: number }
  > {}
