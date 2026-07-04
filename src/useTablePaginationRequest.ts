import { usePagination, type PaginationOptions } from 'vue-request';
import { computed, unref, type Ref } from 'vue';
import { IArrayable, Mutate, Recordable } from './type';

type SortOrder = 'ascend' | 'descend';

interface Sorter {
    field: string;
    order: SortOrder;
}

interface TablePaginationRequestBody<
  Search extends Recordable<any> = any,
> {
  pagination: {
    current: number;
    pageSize: number;
  };
  search: Search;
  sort: {
    predicate: string;
    reverse: boolean;
  };
}

interface TablePaginationResponse<
  Record extends Recordable<any> = any,
  E = any,
> extends Recordable {
  pagination: {
    current?: number;
    pageCount?: number;
    pageSize?: number;
    total?: number;
  };
  list?: Record[];
  extendData?: E;
}

interface TabelServiceParams extends Recordable {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: SortOrder;
}
interface TabelServiceFetcher<D, S extends Recordable<any>> {
  (data: TablePaginationRequestBody<S>): Promise<D>;
}
export function useTablePaginationRequest<
  E,
  D extends Recordable<any>,
  S extends Recordable<any>,
>(
  search: Ref<S>,
  fetcher: TabelServiceFetcher<TablePaginationResponse<D, E>, S>,
  options?: PaginationOptions<
    TablePaginationResponse<D, E>,
    TabelServiceParams[]
  >,
) {
  const {
    current,
    data,
    loading,
    pageSize,
    refresh: refreshCurrent,
    run,
    total,
    mutate,
  } = usePagination(handleSearch, {
    defaultParams: [
      {
        current: 1,
        pageSize: 10,
      },
    ],
    pagination: {
      totalKey: 'pagination.total',
      totalPageKey: 'pagination.pageCount',
    },
    ...options,
  });
  const dataSource = computed<D[]>(() => {
    return data.value?.list || [];
  });
  const pagination = computed(() => ({
    current: current.value,
    pageSize: pageSize.value,
    total: total.value,
  }));
  const handleTableChange = (
    pagination: {
      current: number;
      pageSize: number;
    },
    filters: Recordable,
    sorter: IArrayable<Sorter>,
  ) => {
    if (!Array.isArray(sorter)) {
      sorter = [sorter];
    }
    run({
      current: pagination.current,
      pageSize: pagination.pageSize,
      sortField: sorter[0]?.field as string,
      sortOrder: sorter[0]?.order,
      ...filters,
    });
  };
  function handleSearch(params: TabelServiceParams) {
    return fetcher({
      pagination: {
        current: params.current as number,
        pageSize: params.pageSize as number || options?.defaultParams?.[0]?.pageSize as number,
      },
      search: unref(search),
      sort: {
        predicate: params.sortField as string,
        reverse: params.sortOrder === 'descend',
      },
    });
  }
  function handlePaginationChange(_page: number, _pageSize: number) {
    if (pageSize.value !== _pageSize)
      pageSize.value = _pageSize
    if (current.value !== _page)
      current.value = _page
  }
  function refresh() {
    current.value = 1;
  }
  return {
    dataSource,
    handleTableChange,
    loading,
    pagination,
    refresh,
    refreshCurrent,
    total,
    mutate: mutate as Mutate<TablePaginationResponse<D, E>>,
    handlePaginationChange
  };
}
type PaginationData<T, E> = {
  items: T[]
  count: number
  extend?: E;
}
type PaginationQuery = {
  current: number;
  pageSize: number;
}
export function normalizePaginationData<Record extends Recordable<any>, E = any>(data: PaginationData<Record, E>, query: PaginationQuery): TablePaginationResponse<Record, E> {
  return {
    pagination: {
      current: query.current,
      pageSize: query.pageSize,
      pageCount: Math.ceil(data.count / query.pageSize),
      total: data.count
    },
    extendData: data.extend,
    list: data.items
  }
}