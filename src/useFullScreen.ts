import { onMounted, onUnmounted, ref, Ref } from "vue"

export function useFullScreen(target: Ref<HTMLElement>) {
    const isFullScreen = ref(!!getFullScreenElement())
    onMounted(() => {
        window.document.addEventListener("fullscreenchange", fullscreenchangeHandler, false)
    })
    onUnmounted(() => {
        window.document.removeEventListener("fullscreenchange", fullscreenchangeHandler, false)
    })
    function enterFullScreen() {
        if (target.value && target.value.requestFullscreen) {
            target.value.requestFullscreen()
        }
    }
    function exitFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen()
        }
    }
    function toggleFullScreen() {
        if (!getFullScreenElement()) {
            enterFullScreen()
        } else {
            exitFullScreen()
        }
    }
    function getFullScreenElement() {
        return document.fullscreenElement
    }
    function fullscreenchangeHandler() {
        isFullScreen.value = !!document.fullscreenElement
    }
    return {
        isFullScreen,
        getFullScreenElement,
        enterFullScreen,
        exitFullScreen,
        toggleFullScreen
    }
}