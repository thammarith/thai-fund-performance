export const TODAY = new Date();
export const TOMORROW = new Date(new Date().setDate(TODAY.getDate() + 1));
export const NEXT_MONTH = new Date(new Date().setMonth(TODAY.getMonth() + 1));
