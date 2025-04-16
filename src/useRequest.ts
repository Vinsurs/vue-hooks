import { ref } from "vue"

interface Fetcher<D = any> {
    (): Promise<D>
  }
  type FetchStatus = "idle" | "pending"
  export function useRequest<D>(fetcher: Fetcher<D>, immediate = true) {
    const status = ref<FetchStatus>("idle")
    const data = ref<D | null>(null)
    const error = ref<Error|null>(null)
    immediate && refresh()
    async function refresh() {
      try {
        if (status.value === "idle") {
          status.value = "pending"
            // @ts-ignore
          data.value = await fetcher()
          error.value = null
        }
      } catch (err) {
        // @ts-ignore
        error.value = err
        data.value = null
      } finally {
        if (status.value === "pending") {
          status.value = "idle"
        }
      }
    }
    return {
      status,
      data,
      error,
      refresh
    }
  }