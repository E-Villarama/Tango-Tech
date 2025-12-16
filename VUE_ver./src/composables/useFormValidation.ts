// Form validation composable for OnboardingForm
import { computed, type Ref, type ComputedRef } from 'vue'
import type { OnboardingFormData } from '../types/onboarding'
import type { FormField } from '../../components/formFields/types'

interface UseFormValidationOptions {
    formFields: FormField[]
    formData: OnboardingFormData
    documents: Record<string, File[]>
    fieldsByPage: ComputedRef<Record<number, FormField[]>>
    currentPage: Ref<number>
    bypassValidation: Ref<boolean>
    errorMessage: Ref<string>
}

export function useFormValidation({
    formFields,
    formData,
    documents,
    fieldsByPage,
    currentPage,
    bypassValidation,
    errorMessage
}: UseFormValidationOptions) {
    // Validate current page only
    const isCurrentPageValid = computed(() => {
        // Admin bypass: skip all validation
        if (bypassValidation.value) {
            return true
        }
        
        const pageFields = fieldsByPage.value[currentPage.value] || []
        
        for (const field of pageFields) {
            if (field.type === 'document') {
                if (field.required && (!documents[field.id] || documents[field.id].length === 0)) {
                    return false
                }
            } else if (field.type === 'multiselect') {
                if (field.required && (!formData[field.key] || (formData[field.key] as any[]).length === 0)) {
                    return false
                }
                // Check "other" text if needed
                if (formData[field.key] && Array.isArray(formData[field.key]) && (formData[field.key] as string[]).includes('other')) {
                    const otherTextKey = `${field.key}Other`
                    const otherText = formData[otherTextKey] as string
                    if (!otherText || String(otherText).trim() === '') {
                        return false
                    }
                }
            } else if (field.type === 'signature') {
                if (field.required) {
                    const signatureData = formData[field.key] as any
                    if (!signatureData || !signatureData.consentGiven) {
                        return false
                    }
                    // Both drawn signature and typed name are required
                    if (!signatureData.signatureImage) {
                        return false
                    }
                    if (!signatureData.typedName || signatureData.typedName.trim() === '') {
                        return false
                    }
                }
            } else {
                if (field.required && !formData[field.key]) {
                    return false
                }
            }
        }
        
        return true
    })

    // Validate entire form
    const validateForm = (): boolean => {
        // Admin bypass: skip all validation
        if (bypassValidation.value) {
            return true
        }
        
        errorMessage.value = ''
        
        // Validate all fields (both input and document)
        for (const field of formFields) {
            if (field.type === 'document') {
                if (field.required && (!documents[field.id] || documents[field.id].length === 0)) {
                    errorMessage.value = `Please upload ${field.label}`
                    return false
                }
            } else if (field.type === 'multiselect') {
                if (field.required && (!formData[field.key] || (formData[field.key] as any[]).length === 0)) {
                    errorMessage.value = `Please select at least one option for ${field.label}`
                    return false
                }
                // Check if "other" is selected and otherText is required
                if (formData[field.key] && Array.isArray(formData[field.key]) && (formData[field.key] as string[]).includes('other')) {
                    const otherTextKey = `${field.key}Other`
                    const otherText = formData[otherTextKey] as string
                    if (!otherText || String(otherText).trim() === '') {
                        errorMessage.value = `Please specify your other option for ${field.label}`
                        return false
                    }
                }
            } else if (field.type === 'signature') {
                if (field.required) {
                    const signatureData = formData[field.key] as any
                    if (!signatureData || !signatureData.consentGiven) {
                        errorMessage.value = 'Please provide your electronic signature and consent.'
                        return false
                    }
                    // Both drawn signature and typed name are required
                    if (!signatureData.signatureImage) {
                        errorMessage.value = 'Please draw your signature.'
                        return false
                    }
                    if (!signatureData.typedName || signatureData.typedName.trim() === '') {
                        errorMessage.value = 'Please type your full legal name.'
                        return false
                    }
                }
            } else {
                if (field.required && !formData[field.key]) {
                    errorMessage.value = `Please fill in ${field.label}`
                    return false
                }
            }
        }
        
        return true
    }

    return {
        isCurrentPageValid,
        validateForm
    }
}

