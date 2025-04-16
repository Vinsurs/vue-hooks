import { arrayMoveMutable } from 'array-move'

export * from 'array-move'
interface ArrayPredicate<T = Record<string, any>> {
    (value: T, index: number, obj: T[]): unknown
}
export function noop() {}
export function cloneDeep<T = any>(value: T): T {
  return 'structuredClone' in globalThis ? structuredClone(value) : JSON.parse(JSON.stringify(value))
}
export function closeCurrentWindow() {
    if (typeof window === 'object') {
        window.open('', '_self', '')
        window.close()
    }
}
export function removeItem<T = Record<string, any>>(items: T[], predicate: ArrayPredicate<T>) {
    const index = items.findIndex(predicate)
    if (~index) {
      items.splice(index, 1)
    }
  }
  export function sortItem<T = Record<string, any>>(items: T[], predicate: ArrayPredicate<T>, type: 'up' | 'down') {
    const index = items.findIndex(predicate)
    const isFirst = index === 0
    const isLast = index === items.length - 1
    if (type === 'up') {
      if (isFirst)
        return
      const prevIndex = index - 1
      arrayMoveMutable(items, index, prevIndex)
    }
    else if (type === 'down') {
      if (isLast)
        return
      const nextIndex = index + 1
      arrayMoveMutable(items, index, nextIndex)
    }
  }