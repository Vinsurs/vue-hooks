import { toValue, type MaybeRefOrGetter } from "vue";

interface UseCopyOptions {
  /**
   * @default true
   */
  tip?: boolean
}
// @ts-ignore
let copyFn = function (toBeCopied: string) {
  if (typeof navigator.clipboard === "object" && window.isSecureContext) {
    copyFn = function (toBeCopied: string) {
      return navigator.clipboard.writeText(toBeCopied)
    }
  } else {
    copyFn = function (toBeCopied: string) {
      return new Promise((resolve, reject) => {
        const textarea = document.createElement("textarea")
        textarea.value = toBeCopied
        document.body.append(textarea)
        textarea.select()
        try {
          document.execCommand("copy")
          resolve(null)
        } catch (error) {
          reject(error)
        } finally {
          document.body.removeChild(textarea)
        }
      })
    }
  }
  return copyFn(toBeCopied)
}
export function useCopy(text: MaybeRefOrGetter, opts?: UseCopyOptions) {
  opts = {
    tip: true,
    ...opts
  }
  function copy(): Promise<void> {
    return copyFn(toValue(text))
  }
  return {
    copy
  }
}