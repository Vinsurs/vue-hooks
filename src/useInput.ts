import { ref } from "vue";

export function useInput(handler: (ev: Event) => any) {
    const composed = ref(false);
    function handleInput(ev: Event) {
        if (!composed.value) {
            handler(ev)
        }
    }
    function handleCompositionStart() {
        composed.value = true
    }
    function handleCompositionUpdate() {
        composed.value = true
    }
    function handleCompositionEnd(ev: CompositionEvent) {
        composed.value = false
        handler(ev)
    }
    return {
        composed,
        handleInput,
        handleCompositionStart,
        handleCompositionUpdate,
        handleCompositionEnd
    }
}