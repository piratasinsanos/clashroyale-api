import {Logger} from "../lib/logger";
import {injectable} from "inversify";

@injectable()
export abstract class BaseService {

    private readonly _logger: Logger;

    protected constructor() {
        this._logger = new Logger();
    }

    get logger(): Logger {
        return this._logger;
    }

}
