import {BaseHttpController, controller, httpDelete, httpGet, httpPost, request, response} from "inversify-express-utils";
import {RankingService, LazyPage} from "../../../../service/ranking.service";
import {RankingModel} from "../../../../model/ranking.model";
import {PayloadRequest} from "../../../../http/payload.request";
import {container} from "../../../../types/inversify.config";
import {MediaType} from "../../../../http/media.type";
import {RequestHandler, Response} from "express";
import {Logger} from "../../../../lib/logger";
import {TYPES} from "../../../../types/types";
import * as passport from "passport";
import {inject} from "inversify";
import {format} from "util";

@controller("/rankings", passport.authenticate("bearer", {
    session: false
}))
export class RankingController extends BaseHttpController {

    private _logger: Logger;

    constructor(@inject(TYPES.RankingService) private service: RankingService) {
        super();
        this._logger = new Logger();
    }

    @httpGet("/", TYPES.AcceptableMiddleware)
    public getRankings(request: PayloadRequest, response: Response): Promise<LazyPage<RankingModel> | void> {

        this._logger.log("debug", format("HTTP %s %s %s", request.method, request.url, response.statusCode));

        response.status(200)
            .header("Content-Version", "v2")
            .header("Content-Message", "rankings")
            .header("Content-Type", MediaType.APPLICATION_JSON);

        return this.service.getRankings(request.query, request.user);

    }

    @httpGet("/:id", TYPES.AcceptableMiddleware)
    public getRanking(request: PayloadRequest, response: Response): Promise<RankingModel | void> {

        response.status(200)
            .header("Content-Version", "v2")
            .header("Content-Message", "rankings")
            .header("Content-Type", MediaType.APPLICATION_JSON);

        return this.service.getRanking(request.params.id, request.user);

    }

    @httpPost("/", container.getNamed<RequestHandler>(TYPES.AcceptableRequestHandler, MediaType.APPLICATION_JSON))
    public setRanking(request: PayloadRequest, response: Response): Promise<RankingModel | void> {

        response.status(200)
            .header("Content-Version", "v2")
            .header("Content-Message", "rankings")
            .header("Content-Type", MediaType.APPLICATION_JSON);

        return this.service.saveRanking(request.body, request.user);

    }

    @httpDelete("/:id", TYPES.AcceptableMiddleware)
    private deleteRanking(@request() request: PayloadRequest, @response() response: Response): Promise<void> {

        response.status(200)
            .header("Content-Version", "v2")
            .header("Content-Message", "rankings")
            .header("Content-Type", MediaType.APPLICATION_JSON);

        return this.service.deleteRanking(request.params.id, request.user);

    }

}
