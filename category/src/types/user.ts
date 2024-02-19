import {Document, Types} from 'mongoose';

export interface Iuser extends Document {
    isVerified:boolean,
    token:string,
    isBlocked:boolean,
    status:{
        value:boolean,
        reason:string
    },
    plan:Types.ObjectId
}