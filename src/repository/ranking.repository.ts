import {RankingQuery} from '../criteria/ranking.query';
import {BaseRepository} from './base.repository';
import {Ranking} from '../model/ranking';
import {Payload} from '../model/payload';
import {injectable} from 'inversify';
import {Schema} from 'mongoose';
import {ObjectID} from 'bson';

@injectable()
export class RankingRepository extends BaseRepository<Ranking> {

    private static COLLECTION_NAME = 'rankings';

    constructor() {
        super(new Schema({
            created: Date,
            clan: new Schema({
                tag: String,
                name: String,
                badgeId: Number,
                type: String,
                clanScore: Number,
                requiredTrophies: Number,
                donationsPerWeek: Number,
                clanChestLevel: Number,
                clanChestMaxLevel: Number,
                members: Number,
                location: new Schema({
                    id: Number,
                    name: String,
                    isCountry: Boolean,
                    countryCode: String
                }),
                description: String,
                clanChestStatus: String,
                clanChestPoints: Number,
                memberList: [new Schema({
                    tag: String,
                    name: String,
                    expLevel: Number,
                    trophies: Number,
                    role: String,
                    clanRank: Number,
                    previousClanRank: Number,
                    donations: Number,
                    donationsReceived: Number,
                    clanChestPoints: Number,
                    arena: new Schema({
                        id: Number,
                        name: String
                    })
                })]
            }),
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

    saveRanking(ranking: Ranking): Promise<Ranking> {
        return this.model.create(ranking);
    }

    countAllByQuery(query: RankingQuery): Promise<number> {
        return this.model.count({
            'clan.tag': query.tag
        }).then((scores: number) => {
            return scores;
        });
    }

    findAllByQuery(query: RankingQuery): Promise<Ranking[]> {
        return this.model.find({
            'clan.tag': query.tag
        }).skip((query.page || 0) * RankingRepository.TOTAL_RECORD_PER_QUERY)
            .limit(RankingRepository.TOTAL_RECORD_PER_QUERY)
            .then((rankings: Ranking[]) => {
                return rankings;
            });
    }

    findRankingById(rankingId: string): Promise<Ranking> {
        return this.model.findById(new ObjectID(rankingId)).then((ranking: Ranking | null) => {
            return <Ranking>ranking;
        });
    }

    deleteRankingById(rankingId: string, operator: Payload): Promise<Ranking> {
        return this.model.findOneAndRemove({
            _id: new ObjectID(rankingId),
            operator: operator
        }).then((ranking: Ranking | null) => {
            return <Ranking>ranking;
        });
    }

}
