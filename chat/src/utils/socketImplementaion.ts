import { Server as HTTPServer } from 'http';

import { IjwtPayload, Irole, SystemRoles, UnauthenticatedError, Users } from '@duvdu-v1/duvdu';
import sharedSession from 'express-socket.io-session';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import { handleSocketEvents } from './handle-socket-events.controller';
import {
  addUserToLogged,
  addUserToVisitor,
  getLoggedCount,
  getVisitorCount,
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
        origin: '*',
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private async setupMiddleware() {
    this.io.use(sharedSession(mySession));
    this.io.use(async (socket: IcustomHandshake, next) => {
      if (!socket.handshake.session.access) {
        await addUserToVisitor();
        this.io
          .to(ROOMS.admins)
          .emit(EVENTS.visitorsCounterUpdate, { counter: await getVisitorCount() });
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
        await addUserToLogged();
        this.io
          .to(ROOMS.admins)
          .emit(EVENTS.loggedCounterUpdate, { counter: await getLoggedCount() });
        next();
      } catch (error) {
        return next(new UnauthenticatedError('invalid or expired token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', this.handleConnection.bind(this));
  }

  private async handleConnection(socket: IcustomHandshake) {
    const userId = (socket as any).loggedUser?.id || null;
    if (userId) {
      await Users.findByIdAndUpdate(userId, { isOnline: true }, { new: true });
      this.io.sockets.sockets.set(userId, socket);
    } else {
      console.log('connect guest');
    }

    handleSocketEvents(this.io, socket);

    socket.on('disconnect', async () => {
      if (userId) {
        await Users.findByIdAndUpdate(userId, { isOnline: false }, { new: true });
        await addUserToLogged(-1);
        this.io
          .to(ROOMS.admins)
          .emit(EVENTS.loggedCounterUpdate, { counter: await getLoggedCount() });
      } else {
        await addUserToVisitor(-1);
        this.io
          .to(ROOMS.admins)
          .emit(EVENTS.visitorsCounterUpdate, { counter: await getVisitorCount() });
      }
    });
  }
}
