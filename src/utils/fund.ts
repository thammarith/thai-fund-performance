import { delay } from "https://deno.land/std@0.42.0/util/async.ts";

import { FUNDS_PATH } from '../constants/path.ts';
import { NEXT_MONTH, TODAY } from '../constants/time.ts';
import { AmcEntity } from '../types/AmcEntity.ts';
import { Cached } from '../types/Cached.ts';
import { Fund } from '../types/Fund.ts';
import { getShouldForceFetchFunds } from './env.ts';
import _fetch from './fetch.ts';
import { readFile, writeFile } from './file.ts';

const fetchAllFundsByAmc = (amc: AmcEntity) =>
    _fetch(`https://api.sec.or.th/FundFactsheet/fund/amc/${amc.unique_id}`)
        .then((response) => response.json() as Promise<Fund[]>)
        .catch((err) => {
            console.error(err);
            return [] as Fund[];
        });

interface getShouldForceFetchProps {
    isForcedByFlag?: boolean;
    cachedData?: Cached<unknown>;
}

const getShouldForceFetch = ({ isForcedByFlag = false, cachedData }: getShouldForceFetchProps) => {
    const isNextUpdateDue = cachedData?.nextUpdate && cachedData.nextUpdate <= TODAY.valueOf();
    return isForcedByFlag || isNextUpdateDue;
};

const getAllFundsByAmc = async (amc: AmcEntity): Promise<Awaited<Fund[]>> => {
    const fileName = FUNDS_PATH.replace(
        '{amc}',
        amc.name_en
            .split(' ')
            .filter((_, i) => i < 2)
            .join('_')
    );
    const cachedFunds = await readFile<Fund[]>(fileName, `Funds by ${amc.name_en} (${amc.unique_id})`);

    const shouldForceFetchFunds = getShouldForceFetch({
        isForcedByFlag: getShouldForceFetchFunds(),
        cachedData: cachedFunds,
    });

    if (!shouldForceFetchFunds && cachedFunds) {
        console.log(`\t- Using cached funds for ${amc.unique_id}`);
        return cachedFunds.data;
    }

    console.log(`\t- Fetching all funds for ${amc.unique_id}`);
    const funds = await fetchAllFundsByAmc(amc);

    if (funds.length) {
        console.log(`\t- Writing funds to cache for ${amc.unique_id}`);
        await writeFile({
            path: fileName,
            data: funds,
            nextUpdate: NEXT_MONTH,
        });
    }

    return funds;
};

export const getAllFunds = async (amcs: AmcEntity[]) => {
    const funds: Fund[] = [];
    for (const amc of amcs) {
        const amcFunds = await getAllFundsByAmc(amc);
        funds.push(...amcFunds)
        await delay(100);
    }
    return funds
}
