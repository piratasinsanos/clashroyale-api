import {BusinessErrorException} from '../errors/business-error-exception';
import {RankingRepository} from '../repository/ranking.repository';
import {RankingQuery} from '../criteria/ranking.query';
import {RankingModel} from '../model/ranking.model';
import {format, isNullOrUndefined} from 'util';
import {inject, injectable} from 'inversify';
import {BaseService} from './base.service';
import {Payload} from '../model/payload';
import {TYPES} from '../types/types';
import {isEmpty} from 'lodash';

@injectable()
export class RankingService extends BaseService {

    constructor(@inject(TYPES.RankingRepository) private repository: RankingRepository) {
        super();
    }

    async getRankings(query: RankingQuery, operator: Payload): Promise<LazyPage<RankingModel> | void> {

        if (isNullOrUndefined(query.player) || isNullOrUndefined(query.tag)) {
            return Promise.reject(new BusinessErrorException(''));
        }

        this.logger.log('debug', format('Counting total amount by query: \n%j', query));

        const scores = await this.repository.countAllByQuery(query).catch((error: any) => {
            throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
        });

        this.logger.log('debug', format('Searching records by query: \n%j', query));

        const rankings: RankingModel[] = await this.repository.findAllByQuery(query).catch((error: any) => {
            throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
        });

        if (isEmpty(rankings)) {
            return;
        }

        // rankings.forEach((ranking: RankingModel) => {
        //
        //     ranking.allowed = !isNullOrUndefined(ranking.operator) && ranking.operator.sub === operator.sub;
        //
        //     if (!isNullOrUndefined(ranking.signature)) {
        //         ranking.player = TypedJSON.parse(TypedJSON.stringify(ranking.player, {
        //             includeTags: [FORM_TAG]
        //         }), Composition, {}, new AesAndRsaEncryptorDecryptor(Buffer.from(ranking.signature, "base64")));
        //     }
        //
        // });

        return {
            scores: scores,
            result: rankings
        };

    }

    async getRanking(rankingId: string, operator: Payload): Promise<RankingModel | void> {

        const ranking: RankingModel = await this.repository.findRankingById(rankingId).catch((error: any) => {
            throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
        });

        if (isNullOrUndefined(ranking)) {
            return;
        }

        this.logger.log('info', format('Operator: %s', ranking.operator.surname));

        ranking.allowed = !isNullOrUndefined(ranking.operator) && ranking.operator.sub === operator.sub;

        // if (!isNullOrUndefined(ranking.signature)) {
        //     ranking.player = TypedJSON.parse(TypedJSON.stringify(ranking.player, {
        //         includeTags: [FORM_TAG]
        //     }), Composition, {}, new AesAndRsaEncryptorDecryptor(Buffer.from(ranking.signature, "base64")));
        // }

        return ranking;

    }

    async saveRanking(ranking: RankingModel, operator: Payload): Promise<RankingModel> {

        if (isNullOrUndefined(ranking) || isNullOrUndefined(ranking.player) ||
            isNullOrUndefined(ranking.player)) {
            throw new BusinessErrorException('RankingModel not found!', 400);
        }

        if (isNullOrUndefined(ranking.player)) {
            throw new BusinessErrorException('Player not found!', 400);
        }

        if (!isNullOrUndefined(operator)) {
            delete operator.roles;
        }

        ranking.operator = operator;

        return this.repository.saveRanking(ranking);

    }

    async deleteRanking(rankingId: string, operator: Payload): Promise<void> {

        const ranking: RankingModel = await this.repository.deleteRankingById(rankingId, operator)
            .catch((error: any) => {
                throw new BusinessErrorException(format('Could not process an operation: \n %s', error), 400);
            });

        if (isNullOrUndefined(ranking)) {
            throw new BusinessErrorException(format('Could not remove ranking with identifier: %s', rankingId), 400);
        }

    }

}

export interface LazyPage<T> {
    scores: number,
    result: Array<T>
}
