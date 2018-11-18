import {BusinessErrorException} from '../errors/business-error-exception';
import {RankingRepository} from '../repository/ranking.repository';
import {RankingQuery} from '../criteria/ranking.query';
import {format, isNullOrUndefined} from 'util';
import {inject, injectable} from 'inversify';
import {BaseService} from './base.service';
import {Ranking} from '../model/ranking';
import {Payload} from '../model/payload';
import {TYPES} from '../types/types';
import {isEmpty} from 'lodash';

@injectable()
export class RankingService extends BaseService {

  constructor(@inject(TYPES.RankingRepository) private repository: RankingRepository) {
    super();
  }

  async getRankings(query: RankingQuery, operator: Payload): Promise<LazyPage<Ranking> | void> {

    if (isNullOrUndefined(query.clan)) {
      return Promise.reject(new BusinessErrorException('Tag of the clan to retrieve is required'));
    }

    this.logger.log('debug', format('Counting total amount by query: \n%j', query));

    const scores = await this.repository.countAllByQuery(query).catch((error: any) => {
      throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
    });

    this.logger.log('debug', format('Searching rankings by query: \n%j', query));

    const rankings: Ranking[] = await this.repository.findAllByQuery(query).catch((error: any) => {
      throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
    });

    if (isEmpty(rankings)) {
      return;
    }

    rankings.forEach((ranking: Ranking) => {

      if (!isNullOrUndefined(ranking.tag)) {

      }

    });

    return {
      scores: scores,
      result: rankings
    };

  }

  async getRanking(rankingId: string, operator: Payload): Promise<Ranking | void> {

    const ranking: Ranking = await this.repository.findRankingById(rankingId).catch((error: any) => {
      throw new BusinessErrorException(format('Could not process an operation: \n%s', error), 400);
    });

    if (isNullOrUndefined(ranking)) {
      return;
    }

    this.logger.log('info', format('Operator: %s', ranking.operator.surname));

    return ranking;

  }

  async saveRanking(rankings: Ranking[], operator: Payload): Promise<Ranking[]> {

    if (isEmpty(rankings)) {
      throw new BusinessErrorException('Rankings not found!', 412);
    }

    delete operator.roles;

    return Promise.all(rankings.map((ranking: Ranking) => {

      if (isNullOrUndefined(ranking.tag)) {
        throw new BusinessErrorException('Clan #tag not found!', 412);
      }

      if (isNullOrUndefined(ranking.member) || isNullOrUndefined(ranking.member.tag) ||
        isNullOrUndefined(ranking.member!.name)) {
        throw new BusinessErrorException('Member #tag or name not found!', 412);
      }

      if (isNullOrUndefined(ranking.member.trophies)) {
        throw new BusinessErrorException('Member trophies not found!', 412);
      }

      ranking.operator = operator;

      return ranking;

    })).then((rankings: Ranking[]) => this.repository.saveRanking(rankings))

  }

  async deleteRanking(rankingId: string, operator: Payload): Promise<void> {

    const ranking: Ranking = await this.repository.deleteRankingById(rankingId, operator)
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
