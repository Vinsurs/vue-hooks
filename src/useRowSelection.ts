import { ref } from "vue";
interface AntdVueTableRowSelection<T> {
    selectedRowKeys: T[]
    onChange: (selectedRowKeys: T[]) => void
    [key: string]: any
}
export function useRowSelection<T extends number | string>(options?: AntdVueTableRowSelection<T>) {
  const rowSelection = ref<AntdVueTableRowSelection<T>>({
    fixed: true,
    onChange(selectedRowKeys) {
      if (rowSelection.value) {
        // @ts-ignore
        rowSelection.value.selectedRowKeys = selectedRowKeys;
      }
    },
    selectedRowKeys: [],
    type: 'checkbox',
    columnWidth: 60,
    preserveSelectedRowKeys: false,
    ...options,
  });
  function clearSelection() {
    if (rowSelection.value) {
      rowSelection.value.selectedRowKeys = []
    }
  }
  return {
    rowSelection,
    clearSelection
  };
}