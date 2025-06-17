import { delay } from 'https://deno.land/std@0.42.0/util/async.ts';

import { META_FETCH_LOG_PATH, NAV_PATH } from '../constants/path.ts';
import { TODAY, TOMORROW } from '../constants/time.ts';
import { Fund } from '../types/Fund.ts';
import _fetch from './fetch.ts';
import { readFile, writeFile } from './file.ts';
import { CompositedFundNav, FundDailyNav } from '../types/Nav.ts';
import { FetchLog } from '../types/Meta.ts';
import { MAX_TRIES } from "../constants/fetch.ts";

const padStart = (value: number) => value.toString(10).padStart(2, '0');

const getDateString = (date: Date) =>
    `${date.getFullYear()}-${padStart(date.getMonth() + 1)}-${padStart(date.getDate())}`;

const fetchNavByProjId = (fund: Fund, date: Date) =>
    _fetch(`https://api.sec.or.th/FundDailyInfo/${fund.proj_id}/dailynav/${getDateString(date)}`)
        .then((response) => {
            if (response.status === 204) {
                console.warn(
                    `[WARN] No nav found for ${fund.proj_id} (${fund.proj_abbr_name}) on ${getDateString(date)}`
                );
                return [] as FundDailyNav[];
            }

            return response.json() as Promise<FundDailyNav[]>;
        })
        .catch((err) => {
            console.log(err.message);
            console.error(err);
            throw err;
            // return [] as FundDailyNav[];
        });

const processNavs = (fund: Fund, navs: FundDailyNav[]) => {
    for (const nav of navs) {
        const updatedNav = { ...nav };
        if (nav.class_abbr_name === '-' || !nav.class_abbr_name) {
            console.warn(`[WARN] weird class name for ${fund.proj_id} (${fund.proj_abbr_name})`);
            updatedNav.class_abbr_name = fund.proj_abbr_name;
        }
        processNav(fund, updatedNav);
    }
};

const processNav = async (fund: Fund, nav: FundDailyNav) => {
    const navName = nav.class_abbr_name.replaceAll('/', '--');
    const fileName = NAV_PATH.replace('{nav}', navName);

    const cachedFunds = await readFile<CompositedFundNav>(fileName, `Nav for ${nav.class_abbr_name}`);

    const newData: CompositedFundNav = {
        lastNav: nav.nav_date,
        fund,
        navs: [...(cachedFunds?.data.navs ?? []), nav].sort((a, b) => a.nav_date.localeCompare(b.nav_date)),
    };

    console.log(`\t- Writing nav to cache for ${nav.class_abbr_name}`);
    await writeFile({
        path: fileName,
        data: newData,
        nextUpdate: TOMORROW,
    });
};

export const getAllNavs = async (funds: Fund[]): Promise<void> => {
    const whiteListedFunds = [
        'M0264_2564', // KFGG-A
        'M0458_2559', // KFAFIX-A
        'M0369_2564', // B-SIPSSF
    ];

    const whiteListedAcms = [
        'C0000000239', // SCBAM
        'C0000005025', // Kiatnakin
        'C0000000021', // Kasikorn
        'C0000000569', // One
    ];

    for (const fund of funds) {
        if (!whiteListedFunds.includes(fund.proj_id) && !whiteListedAcms.includes(fund.unique_id)) continue;

        let fetchLog = await readFile<FetchLog>(META_FETCH_LOG_PATH, `Fetch log`, { silent: true });

        if (!fetchLog) {
            const newFetchLog = {
                path: META_FETCH_LOG_PATH,
                data: {} as FetchLog,
            };

            await writeFile(newFetchLog);
            fetchLog = { ...newFetchLog, lastUpdated: TODAY.valueOf() };
        }

        const today = getDateString(TODAY);

        let [lowerBound, upperBound]: [string, string] | undefined = fetchLog.data[fund.proj_id] ?? [today, today];

        const hasRegistrationDate = fund.regis_date && fund.regis_date !== '-';
        const isUnregistered = fund.regis_date && fund.regis_date > today;
        const isCancelledFund = fund.cancel_date && fund.cancel_date !== '-' && today > fund.cancel_date;
        const isAlreadyFetched = fund.regis_date === lowerBound && upperBound === today;

        if (!hasRegistrationDate || isUnregistered || isCancelledFund || isAlreadyFetched) {
            continue;
        }

        let triesLeft = MAX_TRIES;

        const updateFetchLog = async (newBounds: [string, string]) => {
            const updatedLog = { ...fetchLog.data, [fund.proj_id]: newBounds };
            await writeFile({
                path: META_FETCH_LOG_PATH,
                data: updatedLog,
            });
        }

        while (fund.regis_date! < lowerBound || upperBound < today) {
            if (triesLeft <= 0) {
                console.log(`Finished fetching for ${fund.proj_id} (${fund.proj_abbr_name})`);
                updateFetchLog([fund.regis_date!, upperBound]);
                break;
            }

            const increasedUpperBound = getDateString(new Date(new Date(upperBound).setDate(new Date(upperBound).getDate() + 1)));
            const decreasedLowerBound = getDateString(new Date(new Date(lowerBound).setDate(new Date(lowerBound).getDate() - 1)));

            const dateToFetch = upperBound < today
                ? increasedUpperBound
                : decreasedLowerBound;

            console.log(`Fetching nav (${upperBound < today ? 'upper' : 'lower'}) on ${dateToFetch} for ${fund.proj_id} (${fund.proj_abbr_name})`);

            const navs = await fetchNavByProjId(fund, new Date(dateToFetch));
            if (navs.length) {
                processNavs(fund, navs);
                triesLeft = MAX_TRIES;
            } else {
                triesLeft--;
            }

            const newBounds: [string, string] = upperBound < today
                ? [lowerBound, increasedUpperBound]
                : [decreasedLowerBound, upperBound];

            await updateFetchLog(newBounds);

            if (upperBound < today) upperBound = increasedUpperBound;
            else lowerBound = decreasedLowerBound;

            if (navs.length) await delay(100);
        }
    }

    console.log('Done');
};
