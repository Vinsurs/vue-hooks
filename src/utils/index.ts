import { arrayMoveMutable } from 'array-move'
import { ArrayPredicate, IOption, NestedIOption } from '../type'

export { debounce, throttle } from "throttle-debounce"
export { addListener, removeListener } from 'resize-detector'
export * from '@vinsurs/case-anything'
export { pLimit } from '@vinsurs/p-limit'
export * from 'dataurl-file'
export * from 'array-move'

/**
 * A no-operation function that does nothing and returns nothing.
 * Useful as a default callback or placeholder function.
 */
export function noop() { }
/**
 * Creates a deep clone of the provided value.
 * Uses `structuredClone` if available, otherwise falls back to `JSON.parse(JSON.stringify())`.
 * 
 * @template T - The type of the value being cloned.
 * @param value - The value to deep clone.
 * @returns A deep clone of the provided value.
 */
export function cloneDeep<T>(value: T): T {
  if ('structuredClone' in globalThis) {
    try {
      return structuredClone(value)
    } catch {
      console.warn('structuredClone failed and fallback to JSON.parse(JSON.stringify)')
    }
  }
  return JSON.parse(JSON.stringify(value))
}
/**
 * Closes the current browser window.
 * This function attempts to close the current window by first opening a blank page
 * in the same window to ensure compatibility, then calling the close method.
 * 
 * Note: This may be blocked by modern browsers due to security restrictions
 * if the window was not opened by JavaScript.
 */
export function closeCurrentWindow() {
  if (typeof window === 'object') {
    window.open('', '_self', '')
    window.close()
  }
}
/**
 * Removes the first occurrence of the item that satisfies the provided predicate from the array.
 * 
 * @template T - The type of the items in the array.
 * @param items - The array from which to remove the item.
 * @param predicate - The predicate function to test each element against.
 */
export function removeItem<T = Record<string, any>>(items: T[], predicate: ArrayPredicate<T>) {
  const index = items.findIndex(predicate)
  if (~index) {
    items.splice(index, 1)
  }
}
/**
 * Moves an item in the array up or down by one position based on the predicate.
 * 
 * @template T - The type of the items in the array.
 * @param items - The array containing the items to be sorted.
 * @param predicate - The predicate function to find the target item to move.
 * @param type - The direction to move the item, either 'up' or 'down'.
 */
export function sortItem<T = Record<string, any>>(items: T[], predicate: ArrayPredicate<T>, type: 'up' | 'down') {
  const index = items.findIndex(predicate)
  const isFirst = index === 0
  const isLast = index === items.length - 1
  if (type === 'up') {
    if (isFirst)
      return
    const prevIndex = index - 1
    arrayMoveMutable(items, index, prevIndex)
  }
  else if (type === 'down') {
    if (isLast)
      return
    const nextIndex = index + 1
    arrayMoveMutable(items, index, nextIndex)
  }
}
/**
 * Converts a `Map` to an array of `IOption` objects.
 * 
 * @template K - The type of the keys in the map.
 * @template V - The type of the values in the map.
 * @param map - The map to convert.
 * @returns An array of `IOption` objects.
 */
export function mapToOptions<K extends string | number, V extends string>(map: Map<K, V>): Array<IOption<K>> {
  return Array.from(map).reduce((prev, [value, label], index) => {
    prev[index] = {
      value,
      label
    }
    return prev
  }, new Array<IOption<K>>(map.size))
}
/**
 * Checks if a value is defined and not null.
 * 
 * @template T - The type of the value being checked.
 * @param value - The value to check.
 * @returns True if the value is defined and not null, false otherwise.
 */
export function isSetValue<T>(value: T): value is NonNullable<T> {
  return typeof value !== 'undefined' && value !== null
}
/**
 * Retrieves the popup container element for a trigger node.
 * 
 * @param triggerNode - The trigger element for which to find the popup container.
 * @returns The popup container element.
 */
export function getPopupContainer(triggerNode: HTMLElement) {
  return triggerNode.parentNode as any
}
/**
 * Checks if an object has a property with the specified key.
 * 
 * @template T - The type of the object being checked.
 * @param object - The object to check.
 * @param key - The key of the property to check for.
 * @returns True if the object has the property with the specified key, false otherwise.
 */
export function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(object, key)
}
/**
 * Filters an option based on a user input string.
 * 
 * @template V - The type of the value in the option.
 * @param input - The user input string to filter against.
 * @param option - The option object to filter.
 * @returns True if the option label contains the input string (case-insensitive), false otherwise.
 */
export function filterOption<V extends string | number | boolean = any>(input: string, option: IOption<V>) {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
/**
 * Formats a mobile number by masking all but the first three and last two digits.
 * 
 * @param input - The mobile number string to format.
 * @returns The formatted mobile number string.
 */
export function privatifyMobile(input: string) {
  if (!input) return input
  return input.replace(/^(\d{3})(?:\d+)(\d{2})$/, "$1******$2")
}
/**
 * Formats a duration in seconds to hours, minutes, and seconds.
 * 
 * @param duration - The duration in seconds to format.
 * @returns An object containing hours, minutes, and seconds.
 */
export function formatDuration(duration: number) {
  const hours = Math.trunc(duration / (60 * 60));
  duration = duration % (60 * 60);
  const minutes = Math.trunc(duration / 60);
  duration = duration % 60;
  return {
    hours,
    minutes,
    seconds: duration
  }
}
export function getPasswordRulesRawCodeString() {
  return `
    function getPasswordRules<FormState extends { password?: string; password2?: string; }>(formState: IFn<FormState>, formRef: IFn<INullable<FormInstance>>): { password: IArrayable<RuleObject>; password2: IArrayable<RuleObject>; } {
      return {
          password: [
              {
                  required: true, validator(_, value) {
                      if (!value) {
                          return Promise.reject('请输入新密码');
                      } else if (value.length < 5 || value.length > 15) {
                          return Promise.reject('密码长度需在5~15个字符内');
                      } else if (/[^a-zA-Z0-9]/.test(value)) {
                          return Promise.reject('密码仅可包含字母和数字');
                      }else {
                          if (toValue(formState).password2 !== '') {
                              toValue(formRef)!.validateFields('password2');
                          }
                          return Promise.resolve();
                      }
                  }, trigger: "change"
              },
          ],
          password2: [
              {
                  validator(_, value) {
                      if (!value) {
                          return Promise.reject('请再次输入密码');
                      } else if (value !== toValue(formState).password) {
                          return Promise.reject("两次输入密码不一致");
                      } else {
                          return Promise.resolve();
                      }
                  }, trigger: "change"
              }
          ]
      }
    }
  `
}
/**
 * Recursively searches for a target value in an array of option objects.
 * 
 * @template T - The type of the value in the option.
 * @param list - The array of option objects to search.
 * @param target - The target value to find for.
 * @param path - The array of path objects to store the path to the target value.
 */
export function find<T extends string | number>(list: NestedIOption<T>[], target: NoInfer<T>, path: IOption<T>[]) {
    for (let i = 0; i < list.length; i++) {
        const r = list[i]
        if ((!r.children || r.children.length === 0) && Object.is(r.value, target)) {
            path.unshift({
                value: r.value!,
                label: r.label!
            })
            return r.value
        }
        if (r.children) {
            const cId = find(r.children, target, path)
            if (cId) {
                path.unshift({
                    value: r.value!,
                    label: r.label!
                })
                return r.value
            }
        }
    }
}