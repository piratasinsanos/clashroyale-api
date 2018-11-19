import {Document} from 'mongoose';
import {Payload} from './payload';
import {Member} from './member';
import {ObjectID} from 'bson';

export interface Ranking extends Document {

    _id: ObjectID;

    created: Date;

    operator: Payload;

    tag: String;

    member: Member;

}
