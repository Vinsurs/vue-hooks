import { computed, ref } from "vue"

interface UseContextMenuOpts {
    shouldTrigger?(el: HTMLElement): boolean
    beforeShow?(el: HTMLElement): void
    afterShow?(el: HTMLElement): void
  }
  /**
   * Hooks used to interaction with context menu.
   * @param opts 
   * @returns 
   * @example 
   * 
   * ```vue
   * <!-- 图片右键菜单 -->
      <div class="context-menu" v-show="showContextMenu" ref="contextMenuRef"
        :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }">
        <div v-for="item of contextMenus" :key="item.key" class="context-menu-item"
          @click="handleContextMenuClick(item.key)">{{ item.text }}</div>
      </div>
      <script setup>
      const { contextMenuRef, showContextMenu, contextMenuPosition, handleContext } = useContextMenu()
      </script>
    ```
   */
  export function useContextMenu(opts?: UseContextMenuOpts) {
    const contextMenuRef = ref<HTMLElement>()
    const _showContextMenu = ref<boolean>(false)
    const showContextMenu = computed<boolean>(() => _showContextMenu.value)
    const contextMenuPosition = ref({
      x: 0,
      y: 0
    })
    function handleContext(ev: MouseEvent) {
      const target = ev.target as HTMLElement
      if (!opts || typeof opts.shouldTrigger === 'undefined') {
        trigger()
      } else if (opts && typeof opts.shouldTrigger === 'function' && opts.shouldTrigger(target)) {
        trigger()
      }
      function trigger() {
        if (!contextMenuRef.value) return
        ev.preventDefault()
        const menuRect = contextMenuRef.value.getBoundingClientRect()
        const viewPortRect = document.documentElement.getBoundingClientRect()
        if (ev.clientX + menuRect.width <= viewPortRect.width) {
          contextMenuPosition.value.x = ev.clientX
        } else {
          contextMenuPosition.value.x = ev.clientX - menuRect.width
        }
        if (ev.clientY + menuRect.height <= viewPortRect.height) {
          contextMenuPosition.value.y = ev.clientY
        } else {
          contextMenuPosition.value.y = ev.clientY - menuRect.height
        }
        opts?.beforeShow?.(target)
        _showContextMenu.value = true
        opts?.afterShow?.(target)
      }
    }
    function closeMenu() {
      _showContextMenu.value = false
    }
    return {
      contextMenuRef,
      contextMenuPosition,
      handleContext,
      showContextMenu,
      closeMenu
    }
  }