import {Document, Types} from 'mongoose';

export interface Iplan extends Document {
    role:Types.ObjectId
}