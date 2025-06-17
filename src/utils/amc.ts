import { AMCS_PATH } from "../constants/path.ts";
import { NEXT_MONTH, TODAY } from "../constants/time.ts";
import { AmcEntity } from '../types/AmcEntity.ts';
import { Cached } from "../types/Cached.ts";
import { getShouldForceFetchAmcs } from './env.ts';
import _fetch from "./fetch.ts";
import { readFile, writeFile } from './file.ts';

const fetchAllAmcs = () =>
    _fetch('https://api.sec.or.th/FundFactsheet/fund/amc')
        .then((response) => response.json() as Promise<AmcEntity[]>)
        .catch((err) => {
            console.error(err);
            return [] as AmcEntity[];
        });

interface getShouldForceFetchProps {
    isForcedByFlag?: boolean;
    cachedData?: Cached<unknown>;
}

const getShouldForceFetch = ({ isForcedByFlag = false, cachedData }: getShouldForceFetchProps) => {
    const isNextUpdateDue = cachedData?.nextUpdate && cachedData.nextUpdate <= TODAY.valueOf();
    return isForcedByFlag || isNextUpdateDue;
}

export const getAllAmcs = async (): Promise<Awaited<AmcEntity[]>> => {
    const cachedAmcs = await readFile<AmcEntity[]>(AMCS_PATH, 'All AMCs');

    const shouldForceFetchAmcs = getShouldForceFetch({
        isForcedByFlag: getShouldForceFetchAmcs(),
        cachedData: cachedAmcs,
    });

    if (!shouldForceFetchAmcs && cachedAmcs) {
        console.log('Using cached AMCs');
        return cachedAmcs.data;
    }

    console.log('Fetching all AMCs');
    const amcs = await fetchAllAmcs();

    if (amcs.length) {
        console.log('Writing AMCs to cache');
        await writeFile({
            path: AMCS_PATH,
            data: amcs,
            nextUpdate: NEXT_MONTH,
        });
    }

    return amcs;
};
