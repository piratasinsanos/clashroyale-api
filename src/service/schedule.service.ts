import {BusinessErrorException} from '../errors/business-error-exception';
import {environment} from '../configuration/environment';
import {format, isNullOrUndefined} from 'util';
import axios, {AxiosResponse} from 'axios';
import {Security} from '../model/security';
import {Ranking} from '../model/ranking';
import {Member} from '../model/member';
import {isEmpty} from 'lodash';
import {v4} from 'uuid';
import {Logger} from '../lib/logger';

export class ScheduleService {

  private readonly _logger: Logger;

  constructor(private timestamp: Date) {
    this._logger = new Logger();
  }

  async process(tag: string): Promise<AxiosResponse<any>> {

    if (isNullOrUndefined(environment.clashroyale.token) || isNullOrUndefined(tag)) {
      return Promise.reject(new BusinessErrorException('Token is required'));
    }

    const request = axios.create({
      baseURL: environment.clashroyale.host,
      timeout: 12000000,
      params: {
        'limit': '30'
      },
      headers: {
        'Accept': 'application/json',
        'Authorization': format('Bearer %s', environment.clashroyale.token)
      }
    });

    this._logger.log('info', format('Cron last date: %s', this.timestamp));

    return request.get(`/clans/${encodeURIComponent(tag)}/members`).then((result: AxiosResponse<any>) => {
      return this.processRankings(result.data.items.map((member: Member) => {
        return {
          created: this.timestamp,
          tag: tag,
          member: member
        }
      }))
    });

  }

  async processRankings(rankins: Ranking[]): Promise<AxiosResponse<any>> {

    if (isEmpty(rankins)) {
      return Promise.reject(new BusinessErrorException('Rankings is required'));
    }

    const request = axios.create({
      baseURL: 'http://localhost:8000/api/v2',
      timeout: 12000000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': format('Bearer %s', Security.generate({
          sub: v4(),
        }))
      }
    });

    this._logger.log('info', format('Cron last date: %s', this.timestamp));

    return request.post('/rankings', rankins)

  }

}
