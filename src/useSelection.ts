import { onMounted, onUnmounted, Ref } from "vue"

export function useSelection(el: Ref<HTMLElement>, selectionChangeHandler: (selection: Selection | null) => any) {
    onMounted(() => {
        attachEvents()
    })
    onUnmounted(() => {
        detachEvent()
    })
    function attachEvents() {
        if (el.value) {
            el.value.addEventListener('mousedown', handleMousedown)
        }
    }
    function detachEvent() {
        if (el.value) {
            el.value.removeEventListener('mousedown', handleMousedown)
            document.removeEventListener("mouseup", handleMouseup)
        }
    }
    function handleMousedown() {
        document.addEventListener("mouseup", handleMouseup)
    }
    function handleMouseup() {
        document.removeEventListener("mouseup", handleMouseup)
        // wait browser to update selection after mouseup
        // to avoid get last selection when selection
        // collapsed due to mouseup
        setTimeout(() => {
            selectionChangeHandler(document.getSelection())
        }, 0);
    }
}