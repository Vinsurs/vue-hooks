import { ref } from "vue";

interface UseOpacityOption {
    /** @default 0 */
    default?: number;
    /** @default 200 */
    threshold?: number;
}
export function useOpacity(opts: UseOpacityOption = { default: 0, threshold: 200 }) {
    const opacity = ref<number>(opts.default!)
    function mutate(current: number) {
        opacity.value = Math.min(current, opts.threshold!) / opts.threshold!;
    }
    return {
        opacity,
        mutate
    }
}