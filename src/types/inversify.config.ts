import {AcceptableMiddleware} from "../middleware/acceptable.middleware";
import {NextFunction, Request, RequestHandler, Response} from "express";
import {RankingRepository} from "../repository/ranking.repository";
import {RankingService} from "../service/ranking.service";
import {MediaType} from "../http/media.type";
import {Container} from "inversify";
import {TYPES} from "./types";

const container = new Container();

container.bind<RankingRepository>(TYPES.RankingRepository)
    .to(RankingRepository).inSingletonScope();

container.bind<RankingService>(TYPES.RankingService).to(RankingService);

container.bind<AcceptableMiddleware>(TYPES.AcceptableMiddleware)
    .toConstantValue(new AcceptableMiddleware([MediaType.APPLICATION_FORM_URLENCODED]));

container.bind<RequestHandler>(TYPES.AcceptableRequestHandler).toConstantValue(
    (request: Request, response: Response, next: NextFunction) => {
        return AcceptableMiddleware.accepts([MediaType.APPLICATION_FORM_URLENCODED], request, next);
    }).whenTargetNamed(MediaType.APPLICATION_FORM_URLENCODED);

container.bind<RequestHandler>(TYPES.AcceptableRequestHandler).toConstantValue(
    (request: Request, response: Response, next: NextFunction) => {
        return AcceptableMiddleware.accepts([MediaType.APPLICATION_JSON], request, next);
    }).whenTargetNamed(MediaType.APPLICATION_JSON);

export {container};
