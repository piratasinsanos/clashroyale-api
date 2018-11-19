import {Logger} from '../lib/logger';
import {injectable} from 'inversify';
import {environment} from '../configuration/environment';

@injectable()
export abstract class BaseService {

  private readonly _logger: Logger;

  protected constructor() {
    this._logger = new Logger({
      message: 'Service initialized',
      level: environment.env === 'test' ? 'error' : 'debug'
    });
  }

  get logger(): Logger {
    return this._logger;
  }

}
