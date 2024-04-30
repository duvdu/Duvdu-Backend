import { dbConnection } from '@duvdu-v1/duvdu';
import mongoose, { Types } from 'mongoose';

import { env } from '../src/config/env';
import { Message } from '../src/models/message.model';

const user1 = new Types.ObjectId('65d46504d0e034a10a845d4f');
const user2 = new Types.ObjectId('65d46504d0e034a10a845d52');
const user3 = new Types.ObjectId('65d46504d0e034a10a845d56');
const user4 = new Types.ObjectId('65d46504d0e034a10a845d59');

const messagesData = [
  {
    sender: user1,
    receiver: user2,
    content: 'Hello, how are you?',
    reactions: [{ type: 'like', user: user1 }],
    watched: false,
  },
  {
    sender: user2,
    receiver: user1,
    content: 'I\'m doing well, thank you!',
    reactions: [{ type: 'love', user: user2 }],
    watched: false,
  },
  {
    sender: user1,
    receiver: user2,
    content: 'Hello, how are you?',
    reactions: [{ type: 'like', user: user1 }],
    watched: false,
  },
  {
    sender: user2,
    receiver: user1,
    content: 'I\'m doing well, thank you!',
    reactions: [{ type: 'love', user: user2 }],
    watched: false,
  },
  {
    sender: user1,
    receiver: user2,
    content: 'Hello, how are you?',
    reactions: [{ type: 'like', user: user1}],
    watched: false,
  },
  {
    sender: user2,
    receiver: user1,
    content: 'I\'m doing well, thank you!',
    reactions: [{ type: 'love', user: user2 }],
    watched: false,
  },
  {
    sender: user1,
    receiver: user3,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user3,
    receiver: user1,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user1 }, { type: 'thumbsUp', user: user3 }],
    watched: false,
  },
  {
    sender: user1,
    receiver: user3,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user3,
    receiver: user1,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user:user1 }, { type: 'thumbsUp', user: user3 }],
    watched: false,
  },
  {
    sender: user1,
    receiver: user3,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user3,
    receiver: user1,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user1 }, { type: 'thumbsUp', user: user3 }],
    watched: false,
  },
  {
    sender: user3,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user3,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user3 }],
    watched: false,
  },
  {
    sender: user3,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user3,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user3}],
    watched: false,
  },
  {
    sender: user3,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user3,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user3 }],
    watched: false,
  },
  {
    sender: user4,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user4,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user4 }],
    watched: false,
  },
  {
    sender: user4,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user4,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user4 }],
    watched: false,
  },
  {
    sender: user4,
    receiver: user2,
    content: 'Would you like to meet up for coffee?',
    reactions: [],
    watched: false,
  },
  {
    sender: user2,
    receiver: user4,
    content: 'Sure, I would love to!',
    reactions: [{ type: 'like', user: user2 }, { type: 'thumbsUp', user: user4 }],
    watched: false,
  },
];
  

export const appInit = async () => {
  await dbConnection(env.mongoDb.uri);
  await Message.insertMany(messagesData);
  await mongoose.connection.close();
};

appInit();