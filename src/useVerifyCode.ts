import { MaybeRefOrGetter, ref, toValue } from "vue"
import { useCutdown } from "./useCutdown"

interface Action {
    (mobile: string): Promise<unknown>
}
interface UIOptions {
    empty?: () => void
    success?: () => void
    error?: (error: unknown) => void
}
export function useVerifyCode(duration: number, mobile: MaybeRefOrGetter<string>, action: Action, options?: UIOptions) {
    const lock = ref(false)
    const { remain, running, start, stop } = useCutdown(duration)
    async function triggerSend() {
        const target = toValue(mobile)
        if (!target) {
            options?.empty?.()
            return
        }
        if (toValue(lock)) return;
        try {
            lock.value = true
            await action(target)
            lock.value = false
            options?.success?.()
            start()
        } catch (error) {
            lock.value = false
            options?.error?.(error)
            stop()
        }         
    }
    function reset() {
        lock.value = false
        stop()
    }
    return {
        remain,
        running,
        triggerSend,
        reset
    }
}