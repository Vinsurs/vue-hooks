import { computed, MaybeRefOrGetter, Ref, ref, toValue } from "vue";
import { isSetValue } from "./utils";
import { MaybeUndefined } from "./type";

interface StepHandler<T> {
  (nextValue: T): any
}
export function usePrevNext<T extends number | string>(
  list: MaybeRefOrGetter<T[]>,
  initialValue?: NoInfer<T>,
) {
  const current = ref<MaybeUndefined<T>>(initialValue);
  const disableState = computed(() => {
    const state = {
      prev: false,
      next: false,
      currentIndex: -1,
    };
    const _list = toValue(list);
    if (_list.length > 0 && isSetValue(current.value)) {
      // @ts-ignore
      const currentIndex = _list.indexOf(current.value);
      state.currentIndex = currentIndex;
      state.prev = currentIndex <= 0;
      state.next = currentIndex >= _list.length - 1;
    }
    return state;
  });
  function prev(handler?: StepHandler<T>) {
    if (disableState.value.prev) {
      return;
    }
    const _list = toValue(list);
    if (_list.length > 0) {
      const { currentIndex } = disableState.value;
      // @ts-ignore
      current.value = _list[currentIndex - 1];
      handler?.(current.value)
    }
  }
  function next(handler?: StepHandler<T>) {
    if (disableState.value.next) {
      return;
    }
    const _list = toValue(list);
    if (_list.length > 0) {
      const { currentIndex } = disableState.value;
      // @ts-ignore
      current.value = _list[currentIndex + 1];
      handler?.(current.value)
    }
  }
  function reset() {
    // @ts-ignore
    current.value = initialValue;
  }
  function assign(value: T) {
    // @ts-ignore
    current.value = value;
  }
  return {
    current: current as Ref<MaybeUndefined<T>>,
    disableState,
    prev,
    next,
    reset,
    assign,
  };
}