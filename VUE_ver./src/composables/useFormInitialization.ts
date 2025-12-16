import { reactive, type Ref } from 'vue'

interface FormField {
    id: string
    key: string
    type: string
}

/**
 * Initialize form data structure based on field definitions
 */
export function useFormInitialization<T extends FormField>(
    fields: T[],
    formData: Record<string, any>
) {
    const initializeFormData = () => {
        fields.forEach(field => {
            if (field.type === 'multiselect') {
                formData[field.key] = []
                formData[`${field.key}Other`] = ''
            } else if (field.type === 'checkbox') {
                formData[field.key] = false
            } else if (field.type === 'signature') {
                formData[field.key] = null
            } else {
                formData[field.key] = ''
            }
        })
    }

    const resetFormData = () => {
        fields.forEach(field => {
            if (field.type === 'multiselect') {
                formData[field.key] = []
                formData[`${field.key}Other`] = ''
            } else if (field.type === 'checkbox') {
                formData[field.key] = false
            } else if (field.type === 'signature') {
                formData[field.key] = null
            } else {
                formData[field.key] = ''
            }
        })
    }

    return {
        initializeFormData,
        resetFormData
    }
}

