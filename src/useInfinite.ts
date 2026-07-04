import { ref, toValue, watch, type MaybeRefOrGetter } from "vue"

interface Fetcher<D = any> {
  (...args: unknown[]): Promise<D>
}
export function useInfinite<D = any>(fetcher: Fetcher<D>, hasNext: MaybeRefOrGetter<boolean>, options?: IntersectionObserverInit) {
  const pristine = ref<boolean>(true)
  const active = ref<boolean>(true)
  const loading = ref<boolean>(false)
  const target = ref<HTMLElement>()
  const observer = new IntersectionObserver(function (entries) {
    if (active.value && entries.length && entries[0].isIntersecting) {
      trigger()
    }
  }, options)
  const unWatch = watch(target, function () {
    if (target.value) {
      observer.observe(target.value)
    }
  })
  function dispose() {
    unWatch()
    observer.disconnect()
  }
  function closeLoading() {
    loading.value = false
  }
  function enable() {
    active.value = true
  }
  function disable() {
    active.value = false
  }
  async function trigger(...args: unknown[]) {
    if (!loading.value && toValue(hasNext)) {
      try {
        loading.value = true
        return await fetcher(...args)
      } finally {
        pristine.value = false
        closeLoading()
      }
    }
  }
  return {
    indicatorRef: target,
    loading,
    dispose,
    closeLoading,
    enable,
    disable,
    trigger,
    /** Whether the infinite scroll is pristine (has not been triggered yet) */
    pristine
  }
}