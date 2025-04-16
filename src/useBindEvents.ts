import { onMounted, onUnmounted, Ref, unref } from "vue"

export function useBindEvents<T extends Node>(el: Ref<T> | T, eventBindings: {
    [event in keyof HTMLElementEventMap]?: {
        handler: (this: ThisType<T>, ev: HTMLElementEventMap[event]) => any,
        options?: boolean | AddEventListenerOptions
    }
}) {
    onMounted(() => {
        const target = unref(el)
        if (target) {
            Object.keys(eventBindings).forEach(event => {
                // @ts-ignore
                target.addEventListener(event, eventBindings[event].handler, eventBindings[event].options)
            })
        }
    })
    onUnmounted(() => {
        const target = unref(el)
        if (target) {
            Object.keys(eventBindings).forEach(event => {
                // @ts-ignore
                target.removeEventListener(event, eventBindings[event].handler, eventBindings[event].options)
            })
        }
    })
}