import { useRequest, type Options } from "vue-request";

interface UseCacheRequestOpts<T> extends Omit<Options<T, []>, "cacheKey" | "staleTime" | "setCache" | "getCache"> {
    fetcher(): Promise<T>
    getCacheKey?: (fetcherName: string) => string
}
const defCacheTime = 24 * 60 * 60 * 1000
export function useCacheRequest<T>(opts: UseCacheRequestOpts<T>) {
    const { cacheTime = defCacheTime, fetcher, getCacheKey, ..._opts } = opts ?? {};
    const fetcherName = fetcher.name || 'anonymous'
    const cacheKey = typeof getCacheKey === 'function' ? getCacheKey(fetcherName) : fetcherName
    const { data, loading, refreshAsync } = useRequest(fetcher, {
        cacheKey,
        staleTime: cacheTime,
        setCache: (cacheKey, data) => {
            localStorage.setItem(cacheKey, JSON.stringify(data))
        },
        getCache: cacheKey => {
            const cached = localStorage.getItem(cacheKey)
            if (cached) {
                return JSON.parse(cached)
            }
        },
        ..._opts,
    })
    function invalidate(run = true) {
        localStorage.removeItem(cacheKey)
        run && refreshAsync()
    }
    return {
        data,
        loading,
        refreshAsync,
        invalidate
    }
}