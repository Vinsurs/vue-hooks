import { computed, onBeforeUnmount, onMounted, ref, triggerRef, unref, watch, type CSSProperties, type Ref } from "vue"
import { useEffectScope } from "./useEffectScope"
import { INullable } from "./type"

interface UseFollowMaskOpts<T extends HTMLElement> {
    filter(el: T, ev: MouseEvent): INullable<T>
}
interface FollowDetail {
    w: number
    h: number
    x: number
    y: number
}
/**
 * @example
 * ```html
 * <template>
 * <div ref="maskEl" class="fixed bg-black/60 flex flex-row justify-center items-center cursor-move" 
        :style="maskStyle"
    >
        <div class="flex flex-col justify-center items-center text-white cursor-pointer !leading-4 select-none">
            <i class="iconfont icon-bianjiqi_bianji"></i>
            <span class="text-xs">Change</span>
        </div>
    </div>
    </template>
    <script setup lang="ts">
    const { maskEl, maskStyle, matched } = useFollowMask(<Ref<HTMLElement>>target, {
        filter(el) {
            return el instanceof HTMLImageElement
        },
    })
    </script>
 * ```
 */
export function useFollowMask<T extends HTMLElement>(target: Ref<T>, opts: UseFollowMaskOpts<T>) {
    const { filter } = opts
    const maskEl = ref<HTMLElement>()
    const matched = ref<INullable<T>>(null)
    const detail = ref(getInitialDetail())
    const maskStyle = computed<CSSProperties>(() => {
        return {
            width: `${detail.value.w}px`, 
            height: `${detail.value.h}px`, 
            top: `${detail.value.y}px`, 
            left: `${detail.value.x}px`,
            // "transition-duration": "300ms",
            // "transition-property": "width, height, top, left"
        }
    })
    function getInitialDetail(): FollowDetail {
        return {
            w: 0,
            h: 0,
            x: 0,
            y: 0
        }
    }
    useEffectScope(() => {
        watch(target, (next, prev, onCleanup) => {
            onCleanup(() => {
                prev?.removeEventListener("mouseover", enterTarget, false)
            })
            next?.addEventListener("mouseover", enterTarget, false)
        }, {
            flush: 'post',
            immediate: true
        })
    })
    onMounted(() => {
        unref(maskEl)!.addEventListener("mouseout", leaveTarget, true)
    })
    onBeforeUnmount(() => {
        unref(target)?.removeEventListener("mouseover", enterTarget, false)
        unref(maskEl)!.removeEventListener("mouseout", leaveTarget, true)
    })
    function enterTarget(ev: MouseEvent) {
        // if (matched.value) return
        let el: INullable<HTMLElement> = <HTMLElement>ev.target
        if ((el = filter(el as T, ev))) {
            matched.value = el
            followMatchedStyle()
            if (maskEl.value) {
                maskEl.value.style.setProperty("opacity", "1")
                maskEl.value.style.setProperty("z-index", "10")
            }
        }
    }
    function leaveTarget(ev: MouseEvent) {
        ev.stopPropagation()
        if (!matched.value) return
        if (maskEl.value && !maskEl.value.contains(<T>ev.relatedTarget)) {
            unsetMatched()
        }
    }
    function followMatchedStyle() {
        if (matched.value) {
            const { width, height, x, y } = matched.value.getBoundingClientRect()
            detail.value.w = width
            detail.value.h = height
            detail.value.x = x
            detail.value.y = y
            triggerRef(detail)
        }
    }
    function unsetMatched() {
        if (maskEl.value) {
            maskEl.value.style.setProperty("opacity", "0")
            maskEl.value.style.setProperty("z-index", "-1")
            matched.value = null
        }
    }
    return {
        maskEl,
        detail,
        maskStyle,
        matched: matched as Ref<INullable<T>>,
        followMatchedStyle,
        unsetMatched
    }
}
