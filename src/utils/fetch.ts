
import { getFundDailyInfoApiKey, getFundFactsheetApiKey } from './env.ts';

interface fetcherProps {
    method?: string;
    body?: RequestInit['body'];
}

const getKey = (url: string) => {
    if (url.includes('/FundDailyInfo/')) return getFundDailyInfoApiKey();
    if (url.includes('/FundFactsheet/')) return getFundFactsheetApiKey();
    throw new Error('Invalid URL');
};

const _fetch = (url: string, { method, body }: fetcherProps = {}) =>
    fetch(url, {
        method,
        body,
        headers: {
            'Cache-Control': 'no-cache',
            'Ocp-Apim-Subscription-Key': getKey(url) ?? '',
        },
    });

export default _fetch
