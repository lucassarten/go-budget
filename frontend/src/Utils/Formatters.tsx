import { getUnixTime, parse } from 'date-fns';

export const unixToDate = (timestamp: number) => new Date(timestamp * 1000);
export const dateToUnix = (date: { getTime: () => number; }) => Math.floor(date.getTime() / 1000);

export function formatCurrency(value: number) {
    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "NZD",
        currencyDisplay: "symbol",
    });
    return formatter.format(value);
};

export function formatDate(value: number | Date) {
    const date = new Date(value);
    return date.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
    });
};

export function convertToUnixTimestamp(pattern: string, dateStr: string){
    const parsedDate = parse(dateStr, pattern, new Date());
    return getUnixTime(parsedDate);
}