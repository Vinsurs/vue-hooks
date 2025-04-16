import { ref } from "vue"

interface Pagination {
    current: number
    pageSize: number
    total: number
  }
  interface PaginationData<D = any> {
    list: D[]
    pagination: Pagination
  }
  export function usePaginationData<D = any>() {
    const list = ref<D[]>([])
    const hasNext = ref(true)
    function evaluate(paginationData: PaginationData<D>) {
        const { pagination, list: items } = paginationData
        // @ts-ignore
        list.value = pagination.current === 1 ? items : list.value.concat(items as any)
        hasNext.value = items.length >= pagination.pageSize
    }
    function reset(clearList = true) {
      if (clearList) {
        list.value = []
      }
      hasNext.value = true
    }
    return {
      list,
      hasNext,
      evaluate,
      reset
    }
  }