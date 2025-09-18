import { Server as HTTPServer } from 'http';

import { IjwtPayload, Irole, SystemRoles, UnauthenticatedError, Users } from '@duvdu-v1/duvdu';
import sharedSession from 'express-socket.io-session';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { handleSocketEvents } from './handle-socket-events.controller';
import { handleEndUserSession, handleUserSession } from './handle-user-session.controller';
import {
  addUserToVisitor,
  getVisitorCount,
  addUniqueLoggedUser,
  removeUniqueLoggedUser,
} from './users-counter';
import { mySession } from '../app';
import { env } from '../config/env';
import { IcustomHandshake } from '../types/customSocket';
import { EVENTS, ROOMS } from '../types/socket-events';

export class SocketServer {
  io: Server;

  constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: [
          '*',
          'http://localhost:3000',
          'http://localhost:3001',
          'https://duvdu.com',
          'https://dashboard.duvdu.com',
        ],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private async setupMiddleware() {
    this.io.use(sharedSession(mySession));
    this.io.use(async (socket: IcustomHandshake, next) => {
      if (!socket.handshake.session.access) {
        // Mark socket as non-authenticated for later handling in connection
        (socket as any).isGuest = true;
        return next();
      }

      try {
        const access = socket.handshake.session.access;
        if (!access) return next(new UnauthenticatedError('access token not found'));
        const payload = jwt.verify(access, env.jwt.secret) as IjwtPayload;

        const user = await Users.findById(payload.id).populate('role');
        if (!user) return next(new UnauthenticatedError('user not found'));
        
        if ((user.role as Irole)?.key === SystemRoles.admin) socket.join(ROOMS.admins);
        (socket as any).loggedUser = payload;
        socket.data.user = user;
        socket.data.role = user.role;
        // Don't increment here - will be handled in connection handler

        next();
      } catch (error) {
        console.error('Middleware error:', error);
        return next(new UnauthenticatedError('invalid or expired token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(socket: IcustomHandshake) {
    const userId = (socket as any).loggedUser?.id || null;
    const isGuest = (socket as any).isGuest || false;
    
    try {
      if (userId) {
        await Users.findByIdAndUpdate(userId, { isOnline: true }, { new: true });
        this.io.sockets.sockets.set(userId, socket);
        
        // Use unique user tracking to prevent double counting across platforms
        const newCount = await addUniqueLoggedUser(userId);
        this.io.emit(EVENTS.loggedCounterUpdate, { counter: newCount });
        
        // Mark this socket as having been counted for logged users
        (socket as any).wasCountedAsLogged = true;
      } else if (isGuest) {
        // Only count as visitor if explicitly marked as guest (non-authenticated)
        await addUserToVisitor();
        this.io
          .emit(EVENTS.visitorsCounterUpdate, { counter: await getVisitorCount() });
        
        // Mark this socket as having been counted for visitors
        (socket as any).wasCountedAsVisitor = true;
      }

      if (socket.data.user) await handleUserSession(this.io, socket);
      
      handleSocketEvents(this.io, socket);

      socket.on('disconnect', async () => {
        try {
          if (socket.data.user) await handleEndUserSession(this.io, socket);
          
          if (userId && (socket as any).wasCountedAsLogged) {
            await Users.findByIdAndUpdate(userId, { isOnline: false }, { new: true });
            const newCount = await removeUniqueLoggedUser(userId);
            this.io.emit(EVENTS.loggedCounterUpdate, { counter: newCount });
          } else if (isGuest && (socket as any).wasCountedAsVisitor) {
            // Only decrease visitor count if this was a guest connection that was counted
            await addUserToVisitor(-1);
            this.io
              .emit(EVENTS.visitorsCounterUpdate, { counter: await getVisitorCount() });
          }
        } catch (error) {
          console.error('Error handling socket disconnect:', error);
        }
      });
    } catch (error) {
      console.error('Error handling socket connection:', error);
    }
  }
}
