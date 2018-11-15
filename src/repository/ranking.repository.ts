import {RankingQuery} from "../criteria/ranking.query";
import {RankingModel} from "../model/ranking.model";
import {BaseRepository} from "./base.repository";
import {Payload} from "../model/payload";
import {injectable} from "inversify";
import {Schema} from "mongoose";
import {ObjectID} from "bson";

@injectable()
export class RankingRepository extends BaseRepository<RankingModel> {

    private static COLLECTION_NAME = "rankings";

    constructor() {
        super(new Schema({
            created: Date,
            control: String,
            signature: String,
            composition: new Schema({}),
            operator: new Schema({
                id: String,
                sub: String,
                mail: String,
                name: String,
                surname: String,
                roles: [String]
            }),
            allowed: Boolean
        }), RankingRepository.COLLECTION_NAME)
    }

    saveRanking(ranking: RankingModel): Promise<RankingModel> {
        return this.model.create(ranking);
    }

    countAllByQuery(query: RankingQuery): Promise<number> {
        return this.model.count({
            "tag": query.tag,
            "player": new ObjectID(query.quantity)
        }).then((scores: number) => {
            return scores;
        });
    }

    findAllByQuery(query: RankingQuery): Promise<RankingModel[]> {
        return this.model.find({
            "tag": query.tag,
            "player": new ObjectID(query.quantity)
        }).skip((query.page || 0) * RankingRepository.TOTAL_RECORD_PER_QUERY)
            .limit(RankingRepository.TOTAL_RECORD_PER_QUERY)
            .then((rankings: RankingModel[]) => {
                return rankings;
            });
    }

    findRankingById(rankingId: string): Promise<RankingModel> {
        return this.model.findById(rankingId).then((ranking: RankingModel | null) => {
            return <RankingModel>ranking;
        });
    }

    deleteRankingById(rankingId: string, operator: Payload): Promise<RankingModel> {
        return this.model.findOneAndRemove({
            _id: new ObjectID(rankingId),
            operator: operator
        }).then((ranking: RankingModel | null) => {
            return <RankingModel>ranking;
        });
    }

}
