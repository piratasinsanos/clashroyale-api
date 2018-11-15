export interface RankingQuery {

    to: Date;
    from: Date;
    page: number;
    limit?: number;
    quantity: number;
    tag: string;
    player: string;

}
