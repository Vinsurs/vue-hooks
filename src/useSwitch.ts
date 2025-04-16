import { ref } from "vue"

export function useSwitch(defValue = false) {
    const state = ref<boolean>(defValue)
    function on() {
      state.value = true
    }
    function off() {
      state.value = false
    }
    function toggle() {
      state.value = !state.value
    }
    return {
      state,
      on,
      off,
      toggle
    }
  }