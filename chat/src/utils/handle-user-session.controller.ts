import { Iuser } from '@duvdu-v1/duvdu';
import { Server, Socket } from 'socket.io';
import UAParser from 'ua-parser-js';

import { Sessions } from '../model/session.model';

export const handleUserSession = async (io: Server, socket: Socket) => {
  const user = socket.data.user as Iuser;
  const ipAddress = socket.handshake.address;

  const userAgent = socket.handshake.headers['user-agent'];

  const parser = new UAParser();
  parser.setUA(userAgent || '');
  const deviceInfo = parser.getResult();

  await Sessions.findOneAndUpdate(
    {
      user: user.id,
    },
    {
      $push: {
        sessions: {
          startAt: new Date(),
          duration: 0,
          ipAddress,
          deviceInfo,
          activityLog: [],
        },
      },
    },
  );
};

export const handleEndUserSession = async (io: Server, socket: Socket) => {
  console.log('start handle disconnect');
  const user = socket.data.user as Iuser;
  if (!user) return;
  const userSession = await Sessions.findOne({
    user: user.id,
  });
  if (!userSession) return;
  const currentSession = userSession?.sessions.at(-1);
  if (!currentSession) return;
  currentSession.endAt = new Date(Date.now());
  currentSession.duration = parseInt(
    `${(currentSession.endAt.getTime() - currentSession.startAt.getTime()) / 1000}`,
  );
  userSession.sessions[userSession.sessions.length - 1] = currentSession;
  await userSession.save();
};
