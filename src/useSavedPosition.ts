import { ref, unref, type MaybeRef } from "vue";

type Position = { x: number; y: number; }
type Target = Window | Element | null | undefined
type TargetEl = MaybeRef<Target>
/**
 * **Note**: this hook is designed to be used with `vue-router`
 */
export function useSavedPosition(target?: TargetEl, initialPosition?: Position) {
  const position = ref<Position>(initialPosition ?? { x: 0, y: 0 });
  function getTarget() {
    return target ? unref(target) ?? window : window
  }
  function savePosition() {
    const o = getTarget()
    if (o instanceof Window) {
      position.value.x = o.scrollX
      position.value.y = o.scrollY
    } else {
      position.value.x = o.scrollLeft
      position.value.y = o.scrollTop
    }
  }
  function resumePosition() {
    const o = getTarget()
    o.scrollTo({
      left: position.value.x,
      top: position.value.y,
      behavior: 'instant'
    })
  }
  return {
    position,
    onActivated: resumePosition,
    onBeforeRouteLeave: savePosition
  }
}