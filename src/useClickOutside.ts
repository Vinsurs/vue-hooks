import { ref, Ref } from "vue"
import { useBindEvents } from "./useBindEvents"

export function useClickOutside(target: Ref<HTMLElement>, callback: (event: MouseEvent) => void) {
    const isClickOutside = ref(false)
    const handleClickOutside = (event: MouseEvent) => {
        if (target.value && !target.value.contains(event.target as Node)) {
            isClickOutside.value = true
            callback(event)
        } else {
            isClickOutside.value = false
        }
    }
    useBindEvents(document, {
        "click": {
            handler: handleClickOutside
        },
        "contextmenu": {
            handler: handleClickOutside
        }
    })
    return {
        isClickOutside
    }
}