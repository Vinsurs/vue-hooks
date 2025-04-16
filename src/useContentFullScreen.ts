import { onMounted, ref, Ref } from "vue"

export function useContentFullScreen(target: Ref<HTMLElement>, zIndex?: () => number) {
    const isFullScreen = ref(false)
    const originStyle: {
        position?: string
        left?: string
        top?: string
        width?: string
        height?: string
        zIndex?: string
    } = {}
    onMounted(saveTargetStyle)
    function saveTargetStyle() {
        if (target.value) {
            originStyle.position = target.value.style.getPropertyValue("position")
            originStyle.left = target.value.style.getPropertyValue("left")
            originStyle.top = target.value.style.getPropertyValue("top")
            originStyle.width = target.value.style.getPropertyValue("width")
            originStyle.height = target.value.style.getPropertyValue("height")
            originStyle.zIndex = target.value.style.getPropertyValue("z-index")
        }
    }
    function enterFullScreen() {
        if (target.value) {
            target.value.style.setProperty("position", "fixed")
            target.value.style.setProperty("left", "0")
            target.value.style.setProperty("top", "0")
            target.value.style.setProperty("width", "100%")
            target.value.style.setProperty("height", "100%")
            target.value.style.setProperty("z-index",  "" + (zIndex ? zIndex() : 999))
            isFullScreen.value = true
        }
    }
    function exitFullScreen() {
        if (target.value) {
            target.value.style.setProperty("position", originStyle.position || null)
            target.value.style.setProperty("left", originStyle.left || null)
            target.value.style.setProperty("top", originStyle.top || null)
            target.value.style.setProperty("width", originStyle.width || null)
            target.value.style.setProperty("height", originStyle.height || null)
            target.value.style.setProperty("z-index", originStyle.zIndex || null)
            isFullScreen.value = false
        }
    }
    function toggleFullScreen() {
        if (!isFullScreen.value) {
            enterFullScreen()
        } else {
            exitFullScreen()
        }
    }
    return {
        isFullScreen,
        enterFullScreen,
        exitFullScreen,
        toggleFullScreen
    }
}