export interface Cached<T> {
    data: T;
    lastUpdated: number;
    nextUpdate?: number;
}
