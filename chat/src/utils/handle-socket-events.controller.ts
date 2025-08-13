import { Server, Socket } from 'socket.io';

import { getLoggedCount, getVisitorCount } from './users-counter';
import { EVENTS } from '../types/socket-events';

export const handleSocketEvents = (io: Server, socket: Socket) => {
  
  socket.on(EVENTS.getVisitorsCounter, async () => {
    try {
      const counter = await getVisitorCount();
      socket.emit(EVENTS.visitorsCounterUpdate, { counter });
    } catch (error) {
      console.error('Error getting visitor count:', error);
      socket.emit(EVENTS.error, { message: 'Failed to get visitor count' });
    }
  });

  socket.on(EVENTS.getLoggedCounter, async () => {
    
    try {
      const counter = await getLoggedCount();
      socket.emit(EVENTS.loggedCounterUpdate, { counter });
    } catch (error) {
      console.error('Error getting logged count:', error);
      socket.emit(EVENTS.error, { message: 'Failed to get logged count' });
    }
  });
};
