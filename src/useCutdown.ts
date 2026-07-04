import { onUnmounted, ref } from "vue"

export function useCutdown(duration: number) {
    let timer: number
    const remain = ref(duration)
    const running = ref(false)
    function start() {
        running.value = true
        clearTimer()
        timer = setTimeout(() => {
            remain.value--;
            if (remain.value < 0) {
                stop()
            } else {
                start()
            }
        }, 1000);
    }
    function stop() {
        running.value = false
        clearTimer()
        remain.value = duration
    }
    function pause() {
        running.value = false
        clearTimer()
    }
    function clearTimer() {
        if (timer) {
            clearTimeout(timer)
        }
    }
    onUnmounted(clearTimer)
    return {
        remain,
        running,
        start,
        stop,
        pause
    }
}