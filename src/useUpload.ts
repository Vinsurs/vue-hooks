import { pLimit } from '@vinsurs/p-limit'
import { triggerFile } from 'dataurl-file'
import { IAwaitable } from './type'
import { MaybeRefOrGetter, Ref, ref, toValue } from 'vue'
import { isSetValue } from './utils'

class ErrorResult extends Error {
    constructor(public file: File, message?: string) {
        super(message)
    }
}
interface ImgCropOptions {
    width?: number
    height?: number
    [key: string]: any
}
interface CropOpenModalOptions extends ImgCropOptions {
    img: File
    success: (file: File) => void
}
interface ImgCropContext {
    imgCropModalRef: Ref<{
        openModal(options: CropOpenModalOptions): void
    }>
}
interface UseImgCropContext {
    (): ImgCropContext
}
interface BaseUploadOpts<UploadResult> {
    receiveResults?: (result: UploadResult[], errors: ErrorResult[]) => void
    tick?: (resultOrErr: UploadResult | ErrorResult, isError: (val: unknown) => val is ErrorResult) => void
    errorHandler?: (e: unknown) => any
    finallyHandler?: () => any
    /**
     * upload type, set `null` to customize with `multipleOrOpts`
     * @default 'image'
     */
    type?: Parameters<typeof triggerFile>['0']
    multipleOrOpts?: Parameters<typeof triggerFile>['1']
    /**
    * for global loading
    */
    toggleGlobalLoading?: (loading: boolean) => void
    pLimitOptions?: Parameters<typeof pLimit>['1']
    beforeUpload?: (files: File[]) => IAwaitable<boolean | undefined>
    unploadFile(file: File): Promise<UploadResult>
}
interface WithoutCropUploadOpts<UploadResult> extends BaseUploadOpts<UploadResult> {
    crop: false
}
interface CropUploadOpts<UploadResult> extends BaseUploadOpts<UploadResult> {
    crop: true
    cropOpts: MaybeRefOrGetter<ImgCropOptions>
    useImgCropContext: UseImgCropContext
}

type UseUploadOpts<UploadResult> = WithoutCropUploadOpts<UploadResult> | CropUploadOpts<UploadResult>

interface UploadActionOpts<UploadResult> extends Pick<UseUploadOpts<UploadResult>, "type" | "multipleOrOpts"> {
    files?: File[]
}
export function useUpload<UploadResult>(opts: UseUploadOpts<UploadResult>) {
    const uploading = ref<boolean>(false)
    opts.crop ??= false
    async function uploadAction(_opts?: UploadActionOpts<UploadResult>) {
        const results: UploadResult[] = []
        const errors: ErrorResult[] = []
        let finalFnCalled = false
        let skip = false
        try {
            const type = typeof _opts?.type === 'undefined' ? opts.type : _opts.type
            const multipleOrOpts = _opts?.multipleOrOpts ?? opts.multipleOrOpts
            const files = _opts?.files ?? await triggerFile(typeof type === "undefined" ? 'image' : type, multipleOrOpts)
            if (typeof opts.beforeUpload === 'function') {
                if ((await opts.beforeUpload(files)) === false) {
                    skip = true
                    return
                }
            }
            let finished = 0
            let multiple = false
            if (typeof multipleOrOpts === "boolean") {
                multiple = multipleOrOpts
            } else if (typeof multipleOrOpts?.multiple === "boolean") {
                multiple = multipleOrOpts.multiple
            }
            if (!multiple && opts.crop) {
                const imgCropContext = opts.useImgCropContext()
                if (imgCropContext && imgCropContext.imgCropModalRef.value) {
                    imgCropContext.imgCropModalRef.value.openModal({
                        img: files[0],
                        success(file) {
                            upload(file, 0)
                        },
                        ...toValue(opts.cropOpts),
                    })
                    return
                }
            }
            pLimit(files.map((file, i) => () => upload(file, i)), opts.pLimitOptions)
            async function upload(file: File, index: number) {
                openLoading()
                try {
                    results[index] = await opts.unploadFile(file)
                } catch (e) {
                    errors[index] = new ErrorResult(file, (e as Error).message ?? e)
                } finally {
                    finished++
                    opts.tick?.(results[index] ?? errors[index], isError)
                    if (finished === files.length) {
                        closeLoading()
                        opts.receiveResults?.(filter(results), filter(errors))
                        callFinalHandler()
                    }
                }
            }
        }
        catch (e) {
            opts.errorHandler?.(e)
        }
        finally {
            skip && callFinalHandler()
        }
        function callFinalHandler() {
            if (finalFnCalled === false) {
                opts.finallyHandler?.()
                finalFnCalled = true
            }
        }
    }
    function isError(val: unknown): val is ErrorResult {
        return val instanceof ErrorResult
    }
    function filter<T>(list: Array<T>): Array<T> {
        return list.filter(l => isSetValue(l))
    }
    function openLoading() {
        if (typeof opts.toggleGlobalLoading === 'function' && !uploading.value) {
            opts.toggleGlobalLoading(true)
        }
        uploading.value = true
    }
    function closeLoading() {
        if (typeof opts.toggleGlobalLoading === 'function' && uploading.value) {
            opts.toggleGlobalLoading(false)
        }
        uploading.value = false
    }
    return {
        uploadAction,
        uploading,
    }
}
