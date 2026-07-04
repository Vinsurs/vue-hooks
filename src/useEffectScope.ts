import { effectScope, onUnmounted } from "vue"

export function useEffectScope<T>(fn: () => T, detached?: boolean): T {
  const scope = effectScope(detached)
  onUnmounted(() => {
    scope.stop()
  })
  return scope.run(fn)!
}