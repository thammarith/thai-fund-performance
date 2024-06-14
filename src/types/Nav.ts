import { Fund } from './Fund.ts';

export interface CompositedFundNav {
    lastNav: string;
    fund: Fund;
    navs: FundDailyNav[];
}

export interface FundDailyNav {
    nav_date: string;
    unique_id: string;
    class_abbr_name: string;
    net_asset: number;
    last_val: number;
    previous_val: number;
    sell_price: number;
    buy_price: number;
    sell_swap_price: number;
    buy_swap_price: number;
    remark_th: string;
    remark_en: string;
    last_upd_date: string;
}
