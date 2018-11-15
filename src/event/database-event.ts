import {EventEmitter} from "events";
import {MongoCallback} from "mongodb";

export class DatabaseEvent extends EventEmitter {

    close(callback?: MongoCallback<void>): void;

}
