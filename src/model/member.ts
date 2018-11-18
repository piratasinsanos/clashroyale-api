import {Arena} from './arena';

export interface Member {
    tag: string;
    name: string;
    expLevel: number;
    trophies: number;
    arena?: Arena;
    role?: string;
    clanRank?: number;
    previousClanRank?: number;
    donations?: number;
    donationsReceived?: number;
    clanChestPoints?: number;
}
