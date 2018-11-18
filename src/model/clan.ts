import {Location} from './location';
import {Member} from './member';

export interface Clan {
    tag: string;
    name: string;
    badgeId: number;
    type: string;
    clanScore: number;
    requiredTrophies: number;
    donationsPerWeek: number;
    clanChestLevel: number;
    clanChestMaxLevel: number;
    members: number;
    location: Location;
    description: string;
    clanChestStatus: string;
    clanChestPoints: number;
    memberList: Member[];
}
