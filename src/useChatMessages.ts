import { useScroll } from "@vueuse/core";
import { ref, nextTick } from "vue";

interface MessageFetcher<T> {
    (args: { pageIndex: number }): Promise<{ items: T[]; hasMore: boolean; }>
}
type Trigger = "top" | "bottom"
export function useChatMessages<T>(fetcher: MessageFetcher<T>, trigger: Trigger = "top", reverse = true) {
    const pageIndex = ref(1)
    const messages = ref<T[]>([])
    const hasNext = ref(true)
    const loading = ref(false)
    const scrollEl = ref<HTMLElement>()
    const { y, arrivedState, measure, isScrolling } = useScroll(scrollEl, {
        behavior: 'instant',
        throttle: 30,
        onScroll() {
            if (trigger === "top" ? arrivedState.top : arrivedState.bottom) {
                loadNext()
            }
        },
    })
    async function scrollTo(position: "start" | "end") {
        const target = scrollEl.value
        if (isScrolling.value || !target) return
        await nextTick()
        measure()
        y.value = position === "end" ? target.scrollHeight : 0
    }
    async function smoothRemainPosition() {
        const target = scrollEl.value
        if (!target) return
        const currentOffset = target.scrollHeight - y.value
        await nextTick()
        measure()
        y.value = target.scrollHeight - currentOffset
    }
    function fetchMessageList(refresh = false) {
        if (loading.value) return
        if (refresh) pageIndex.value = 1
        loading.value = true
        return fetcher({
            pageIndex: pageIndex.value,
        })
        .then(({ items, hasMore }) => {
            const nextMessages = pageIndex.value === 1 ? reverse ? items.reverse() : items : trigger === "top" ? (reverse ? items.reverse() : items).concat(messages.value as T[]) : (messages.value as T[]).concat(reverse ? items.reverse() : items)
            messages.value = nextMessages
            hasNext.value = hasMore
            if (refresh) {
                scrollTo(trigger === "top" ? "end" : "start")
            } else {
                smoothRemainPosition()
            }
        })
        .finally(() => {
            loading.value = false
        })
    }
    function loadNext() {
        if (hasNext.value) {
            pageIndex.value++
            fetchMessageList()
        }
    }
    return {
        loading,
        messages,
        scrollEl,
        scrollTo,
        fetchMessageList,
        loadNext
    }
}