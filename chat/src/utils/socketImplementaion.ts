import { Server as HTTPServer } from 'http';

import { IjwtPayload, UnauthenticatedError, Users } from '@duvdu-v1/duvdu';
import sharedSession from 'express-socket.io-session';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';

import {  mySession } from '../app';
import { env } from '../config/env';
import { IcustomHandshake } from '../types/customSocket';

class SocketServer {
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

  private setupMiddleware() {
    this.io.use(sharedSession(mySession));
    this.io.use(async (socket: IcustomHandshake, next) => {
      console.log(socket.handshake.session);
      
      if (!socket.handshake.session.access)
        return next();
      try {
        const access = socket.handshake.session.access;
        if (!access) return next(new UnauthenticatedError('access token not found'));
        const payload = jwt.verify(access, env.jwt.secret) as IjwtPayload;

        const user = await Users.findById(payload.id);
        if (!user) return next(new UnauthenticatedError('user not found'));
        (socket as any).loggedUser = payload;
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
      await Users.findByIdAndUpdate(userId , {isOnline:true} , {new:true});
      this.io.sockets.sockets.set(userId, socket);
    } else {
      console.log('connect guest');
    }

    socket.on('disconnect' , async () => {
      if (userId) {
        await Users.findByIdAndUpdate(userId , {isOnline:false} , {new :true});
      }else{
        console.log('make implementation by guest');
        
      }
    
    });
  }
}

export default SocketServer;
