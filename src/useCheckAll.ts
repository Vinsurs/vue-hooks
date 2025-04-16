import { ref, type Ref, unref, watch } from 'vue'

export function useCheckAll<T>(
  availableChecks: Ref<T[]> | T[],
  defaultSelectedKeys?: T[],
) {
  defaultSelectedKeys = defaultSelectedKeys || []
  /** For update this, please use `setSelectedKeys` method. */
  const selectedKeys = ref<T[]>(defaultSelectedKeys)
  const state = ref({
    indeterminate: true,
    checkAll: false,
  })
  function handleCheckAllChange(e: any) {
    state.value.checkAll = e.target.checked
    state.value.indeterminate = false
    // @ts-ignore
    selectedKeys.value = e.target.checked ? unref(availableChecks) : []
  }
  watch(
    selectedKeys,
    (val) => {
      const length = unref(availableChecks).length
      state.value.indeterminate = val.length > 0 && val.length < length
      state.value.checkAll = val.length === length
    },
    {
      deep: true,
    },
  )
  function setSelectedKeys(mutation: ((mutatorRef: Ref<T[]>) => void) | T[]) {
    if (typeof mutation === 'function') {
      // @ts-ignore
      mutation(selectedKeys)
    }
    else if (Array.isArray(mutation)) {
      // @ts-ignore
      selectedKeys.value = mutation
    }
  }
  function reset() {
    setSelectedKeys(defaultSelectedKeys as T[])
  }
  function clear() {
    selectedKeys.value = []
  }
  return {
    selectedKeys,
    setSelectedKeys,
    state,
    handleCheckAllChange,
    reset,
    clear,
  }
}
