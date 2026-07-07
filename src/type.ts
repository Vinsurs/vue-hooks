export interface ArrayPredicate<T = Record<string, any>> {
  (value: T, index: number, obj: T[]): unknown
}
export type IOption<T extends number | string | boolean> = {
    [key: string]: any;
    value: T;
    label: string;
}
export interface NestedIOption<T extends number | string> extends IOption<T> {
  children?: NestedIOption<T>[]
}
export type IArrayable<T> = T[] | T
export type Recordable<T = any> = Record<string, T>
export type INullable<T> = T | null
export type IAwaitable<T> = Promise<T> | T
export type MaybeUndefined<T> = T | undefined
export interface Mutate<T> {
  (newData: T): void
  (arg: (oldData: T) => T): void
}
export interface FormInstance {
  validate(): Promise<void>
  clearValidate(): void
  [key: string]: any
}