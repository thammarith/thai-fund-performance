import { getAllAmcs } from "./src/utils/amc.ts";
import { getAllFunds } from "./src/utils/fund.ts";
import { getAllNavs } from "./src/utils/nav.ts";

const amcs = await getAllAmcs();

const funds = await getAllFunds(amcs)

getAllNavs(funds);

export {};
