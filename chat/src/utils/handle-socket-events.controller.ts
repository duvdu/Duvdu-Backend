import { Irole, SystemRoles } from '@duvdu-v1/duvdu';
import { Server, Socket } from 'socket.io';

import { getLoggedCount, getVisitorCount } from './users-counter';
import { EVENTS } from '../types/socket-events';

export const handleSocketEvents = (io: Server, socket: Socket) => {
  const userRole = socket.data.role as Irole | undefined;
  socket.on(EVENTS.getVisitorsCounter, async () => {
    socket.emit(EVENTS.visitorsCounterUpdate, { counter: await getVisitorCount() });
  });

  socket.on(EVENTS.getLoggedCounter, async () => {
    if (userRole?.key !== SystemRoles.admin)
      return socket.emit(EVENTS.error, { message: 'not allowed' });
    socket.emit(EVENTS.response, { counter: await getLoggedCount() });
  });
};
