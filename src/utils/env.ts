import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";

const env = await load();

// API Keys

const getEnv = (key: string): string | undefined => env[key];

export const getFundFactsheetApiKey = () => getEnv('FUND_FACT_SHEET_API_KEY');
export const getFundDailyInfoApiKey = () => getEnv('FUND_DAILY_INFO_API_KEY');

// Caches

const getShouldForceFetch = (key: string) => getEnv(key)?.toLowerCase() === 'true';

export const getShouldForceFetchAmcs = () => getShouldForceFetch('FORCE_FETCH_AMCS');
export const getShouldForceFetchFunds = () => getShouldForceFetch('FORCE_FETCH_FUNDS');
