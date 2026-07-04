import { MaybeRefOrGetter, onMounted, onUnmounted, ref, toValue } from "vue"

export function useFullScreen(target: MaybeRefOrGetter<HTMLElement>) {
    const hasFullScreen = ref(!!getFullScreenElement())
    const isFullScreen = ref(getIsFullScreen())
    onMounted(() => {
        window.document.addEventListener("fullscreenchange", fullscreenchangeHandler, false)
    })
    onUnmounted(() => {
        window.document.removeEventListener("fullscreenchange", fullscreenchangeHandler, false)
    })
    function enterFullScreen() {
        if (toValue(target) && toValue(target).requestFullscreen) {
            toValue(target).requestFullscreen()
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
        hasFullScreen.value = !!document.fullscreenElement
        isFullScreen.value = getIsFullScreen()
    }
    function getIsFullScreen() {
        const element = getFullScreenElement()
        return Boolean(element && element === toValue(target))
    }
    return {
        hasFullScreen,
        isFullScreen,
        getFullScreenElement,
        enterFullScreen,
        exitFullScreen,
        toggleFullScreen
    }
}