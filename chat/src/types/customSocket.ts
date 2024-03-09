import { Session } from 'express-session';
import { Socket } from 'socket.io';

export interface IcustomHandshake extends Socket {
    handshake: {
      session: Session;
    } & any; 
  }