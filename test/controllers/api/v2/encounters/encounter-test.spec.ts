import {environment} from "../../../../../src/configuration/environment";
import {Constants} from "../../../../../src/model/constants";
import {Security} from "../../../../../src/model/security";
import {Logger} from "../../../../../src/lib/logger";
import {app} from "../../../../../src/bootstrap";
import {connect, Mongoose} from "mongoose";
import * as request from "supertest";
import {ObjectID} from "bson";
import {join} from "lodash";
import {v4} from "uuid";

describe("Rankings /api/v2/rankings", function () {

    const logger = new Logger({
        message: "Server initialized",
        level: "error"
    });

    let token: string;

    let connection: Promise<Mongoose>;

    beforeEach(() => {

        token = join(["Bearer", Security.generate({
            sub: v4(),
        })], Constants.EMPTY_STRING);

        // Database connection
        return connection = connect(<string>environment.mongo.host, {
            poolSize: 30
        }).then((mongo: Mongoose) => {
            return mongo;
        });

    });

    afterEach(() => {
        return connection.then((mongo: Mongoose) => {
            return mongo.disconnect().then(() => {
                return logger.log("debug", "The connection closed database!")
            });
        });
    });

    it("get a ranking by identifier (v2)", (done) => {
        request.agent(app).get("/api/v2/rankings/5a58eabfd4c8d60cf87a68f9")
            .set("Content-Type", "application/x-www-form-urlencoded")
            .set("Authorization", token)
            .expect(200)
            .end((error: any) => {
                done(error);
            })
    });

    it("get unregistered ranking service (v2)", (done) => {
        request.agent(app).get("/api/v2/rankings/".concat(new ObjectID().toHexString()))
            .set("Content-Type", "application/x-www-form-urlencoded")
            .set("Authorization", token)
            .expect(204)
            .end((error: any) => {
                done(error);
            })
    });

    it("get unregistered ranking service, bad request (v2)", (done) => {
        request.agent(app).get("/api/v2/rankings/".concat(v4()))
            .set("Content-Type", "application/x-www-form-urlencoded")
            .set("Authorization", token)
            .expect(400)
            .end((error: any) => {
                done(error);
            })
    });

    it("get unregistered ranking service, not acceptable (v2)", (done) => {
        request.agent(app).get("/api/v2/rankings/".concat(v4()))
            .set("Content-Type", "application/json")
            .set("Authorization", token)
            .expect(406)
            .end((error: any) => {
                done(error);
            })
    });

});
