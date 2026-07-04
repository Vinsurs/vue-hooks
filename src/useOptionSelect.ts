import { ref, toRaw, toValue, type MaybeRefOrGetter } from "vue"
import { IOption } from "./type"

interface UseSelectOpts<V extends (number | string)> {
  /** @default 'single'' */
  mode?: "single" | "multiple"
  /** @default true */
  treatAll?: boolean
  allValue?: V
  availableOptions: MaybeRefOrGetter<IOption<V>[]>
  /** @default true */
  rollbackSync?: boolean
  syncSelects(selects: V[], isAll: boolean): void
}
export function useOptionSelect<V extends (number | string)>(opts?: UseSelectOpts<V>) {
  const defOpts = <UseSelectOpts<V>>{
    mode: 'single',
    treatAll: true
  };
  const { mode, treatAll, allValue, availableOptions, rollbackSync = true, syncSelects } = {...defOpts, ...opts };
  const resolvedSelects = ref<V[]>(getInitialSelects() as V[])
  const selects = ref<V[]>(getInitialSelects() as V[])
  function apply() {
    // @ts-ignore
    resolvedSelects.value = cloneSelects(selects.value)
  }
  function rollback() {
    // @ts-ignore
    selects.value = cloneSelects(resolvedSelects.value)
    if (rollbackSync) {
      // @ts-ignore
      syncSelects(selects.value, treatAll ? hasSelected(allValue) : selects.value.length === toValue(availableOptions).length)
    }
  }
  function cloneSelects(s: V[]) {
    return toRaw(s).concat()
  }
  function getInitialSelects() {
    return treatAll ? [allValue] : []
  }
  function isAllValue(value: unknown) {
    return Object.is(value, allValue)
  }
  function handleItemTap(item: IOption<V>) {
    const exists = hasSelected(item.value)
    if (exists) {
      deselect(item.value)
      if (treatAll && selects.value.length === 0) {
        // @ts-ignore
        selects.value.push(allValue)
      }
    } else {
      if (mode === "single") {
        selects.value.length = 0
      }
      if (treatAll) {
        const isAll = isAllValue(item.value)
        if (isAll) {
          selects.value.length = 0
        } else {
          deselect(allValue!)
        }
      }
      // @ts-ignore
      selects.value.push(item.value)
      if (treatAll && selects.value.length === toValue(availableOptions).length - 1) {
        selects.value.length = 0
        // @ts-ignore
        selects.value.push(allValue)
      }
    }
    // @ts-ignore
    syncSelects(selects.value, treatAll ? hasSelected(allValue) : selects.value.length === toValue(availableOptions).length)
  }
  function deselect(value: V) {
    // @ts-ignore
    const index = selects.value.indexOf(value)
    if (~index) {
      selects.value.splice(index, 1)
    }
  }
  function hasSelected(value: V) {
    // @ts-ignore
    return selects.value.includes(value)
  }
  function reset() {
    selects.value.length = 0
    // @ts-ignore
    selects.value.push(...getInitialSelects())
    // @ts-ignore
    syncSelects(selects.value, true)
  }
  function clear() {
    selects.value.length = 0
    // @ts-ignore
    syncSelects(selects.value, false)
  }
  /**
   * Select all options manually.
   * 
   * Note: Only available when mode is 'mutiple' or treatAll is set.
   */
  function selectAll() {
    if (treatAll) {
      selects.value.length = 0
      // @ts-ignore
      selects.value.push(allValue)
      // @ts-ignore
      syncSelects(selects.value, true)
    } else if (mode === 'multiple') {
      selects.value.length = 0
      // @ts-ignore
      selects.value.push(...toValue(availableOptions).map(l => l.value))
      // @ts-ignore
      syncSelects(selects.value, true)
    }
  }
  return {
    selects,
    handleItemTap,
    reset,
    clear,
    selectAll,
    apply,
    rollback
  }
}