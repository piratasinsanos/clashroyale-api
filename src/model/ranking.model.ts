import {Document} from "mongoose";
import {Payload} from "./payload";
import {ObjectID} from "bson";

export interface RankingModel extends Document {

    _id: ObjectID;

    created: Date;

    control: string;

    signature: string | undefined;

    operator: Payload;

    allowed: boolean;

    player: string

}
