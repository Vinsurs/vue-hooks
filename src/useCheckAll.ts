import { MaybeRefOrGetter, Ref, ref, toValue, watch } from "vue";

export function useCheckAll<T>(
  availableChecks: MaybeRefOrGetter<T[]>,
  defaultSelectedKeys?: NoInfer<T[]>,
) {
  defaultSelectedKeys = defaultSelectedKeys || [];
  const selectedKeys = ref<T[]>(defaultSelectedKeys.concat());
  const state = ref({
    indeterminate: true,
    checkAll: false,
  });
  function handleCheckAllChange(e: any) {
    state.value.checkAll = e.target.checked;
    state.value.indeterminate = false;
    // @ts-ignore
    selectedKeys.value = e.target.checked ? toValue(availableChecks) : [];
  }
  watch(
    selectedKeys,
    (val) => {
      const length = toValue(availableChecks).length;
      state.value.indeterminate = val.length > 0 && val.length < length;
      state.value.checkAll = val.length === length;
    },
    {
      deep: true,
    },
  );
  function setSelectedKeys(mutation: ((mutatorRef: Ref<T[]>) => void) | T[]) {
    if (typeof mutation === 'function') {
      // @ts-ignore
      mutation(selectedKeys);
    } else if (Array.isArray(mutation)) {
      // @ts-ignore
      selectedKeys.value = mutation;
    }
  }
  function reset() {
    setSelectedKeys(defaultSelectedKeys!.concat() as T[]);
  }
  function clear() {
    selectedKeys.value = []
  }
  return {
    /** To update this, please use `setSelectedKeys` method. */
    selectedKeys,
    setSelectedKeys,
    state,
    handleCheckAllChange,
    reset,
    clear
  };
}