import { Ref, ref, toValue } from "vue"
import { FormInstance, IArrayable, IAwaitable, INullable, Recordable } from "./type"

type UseFormStateOpts<RuleObject, FormState> = {
    getInitialState(): FormState
    rules?: {
        [k in keyof FormState]: IArrayable<RuleObject>
    }
}
export function useFormState<RuleObject, _FormInstance extends FormInstance, FormState extends Recordable>(opts: UseFormStateOpts<RuleObject, FormState>) {
    const { getInitialState, rules: _rules } = opts
    const formRef = ref<INullable<_FormInstance>>(null)
    const formLoading = ref<boolean>(false)
    const formState = ref<FormState>(getInitialState())
    const rules = ref(_rules)
    async function handleFormSubmit<T>(action: (formState: FormState) => IAwaitable<T>) {
        await formRef.value?.validate()
        return await handleFormFinish<T>(action)
    }
    function resetFormState() {
        formState.value = getInitialState()
        formLoading.value = false
    }
    async function handleFormFinish<T>(action: (formState: FormState) => IAwaitable<T>) {
        try {
            formLoading.value = true
            const res = await action(toValue(formState))
            formLoading.value = false
            resetFormState()
            return res
        } catch (error) {
            formLoading.value = false
            throw error
        }
    }
    function clearValidate() {
        if (formRef.value) {
            formRef.value.clearValidate()
        }
    }
    return {
        formRef: formRef as Ref<INullable<_FormInstance>>,
        formState: formState as Ref<FormState>,
        rules: rules as Ref<UseFormStateOpts<RuleObject, FormState>['rules']>,
        formLoading,
        handleFormSubmit,
        resetFormState,
        handleFormFinish,
        clearValidate
    }
}