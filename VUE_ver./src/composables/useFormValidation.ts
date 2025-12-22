/**
 * Form validation composable for OnboardingForm
 * 
 * This handles all the validation logic for our forms - checking if fields are filled,
 * if patterns match (like email regex), and if documents are uploaded. It's split into
 * two main functions: one for validating just the current page (so users can't skip ahead)
 * and one for validating the entire form before submission.
 * 
 * To modify validation rules, you'll mostly be editing the isCurrentPageValid and validateForm
 * functions below. Each field type has its own validation logic, so if you add a new field type,
 * you'll need to add a new condition here.
 */
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

/**
 * Checks if a field value matches a regex pattern
 * 
 * This is used for things like email validation or phone number formats.
 * If you want to add a new pattern validation, just add the pattern property
 * to your field definition and it'll automatically be checked here.
 * 
 * @param value - The value to check (gets converted to string)
 * @param pattern - Optional regex pattern string
 * @returns true if pattern matches or if there's no pattern
 */
function validatePattern(value: any, pattern?: string): boolean {
    // No pattern means we don't need to validate it
    if (!pattern) return true
    
    // Empty values are handled by the required check, so we skip pattern validation here
    if (value === null || value === undefined || value === '') return true
    
    const stringValue = String(value)
    try {
        const regex = new RegExp(pattern)
        return regex.test(stringValue)
    } catch (error) {
        // If someone passes a bad regex pattern, we don't want to break the form
        // so we just log a warning and let it through
        console.warn('Invalid regex pattern:', pattern, error)
        return true
    }
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
    /**
     * Validates only the current page the user is on
     * 
     * This runs every time the user tries to go to the next page. It checks all fields
     * on the current page and makes sure required ones are filled. If you want to change
     * what makes a page "valid", edit the conditions below for each field type.
     * 
     * Returns true if the page is valid (or if admin bypass is enabled), false otherwise.
     */
    const isCurrentPageValid = computed(() => {
        // Admins can skip validation - useful for testing or special cases
        if (bypassValidation.value) {
            return true
        }
        
        // Get all fields that should be on this page
        const pageFields = fieldsByPage.value[currentPage.value] || []
        
        // Loop through each field and check if it's valid
        for (const field of pageFields) {
            // Document uploads - check if files were uploaded
            if (field.type === 'document') {
                if (field.required && (!documents[field.id] || documents[field.id].length === 0)) {
                    return false
                }
            } 
            // Multiselect fields - check if at least one option is selected
            // Also handles the "other" option - if they select "other", they need to fill in the text field
            else if (field.type === 'multiselect') {
                if (field.required && (!formData[field.key] || (formData[field.key] as any[]).length === 0)) {
                    return false
                }
                // Special case: if they selected "other", make sure they filled in the other text field
                if (formData[field.key] && Array.isArray(formData[field.key]) && (formData[field.key] as string[]).includes('other')) {
                    const otherTextKey = `${field.key}Other`
                    const otherText = formData[otherTextKey] as string
                    if (!otherText || String(otherText).trim() === '') {
                        return false
                    }
                }
            } 
            // Signature fields - need both the drawn signature AND typed name, plus consent
            else if (field.type === 'signature') {
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
            } 
            // Regular input fields (text, email, number, etc.)
            else {
                const fieldValue = formData[field.key]
                
                // First check if it's required and empty
                if (field.required && !fieldValue) {
                    return false
                }
                
                // Then check if it matches the pattern (if a pattern is defined)
                // This is where email regex, phone number patterns, etc. get validated
                if (fieldValue && field.pattern) {
                    if (!validatePattern(fieldValue, field.pattern)) {
                        return false
                    }
                }
            }
        }
        
        return true
    })

    /**
     * Validates the entire form before submission
     * 
     * This is called when the user tries to submit the form. It checks ALL pages,
     * not just the current one. It also sets error messages that get displayed to the user.
     * 
     * If you want to change validation messages or add new validation rules for submission,
     * edit the conditions below. Each field type has its own validation logic.
     * 
     * @returns true if form is valid, false otherwise
     */
    const validateForm = (): boolean => {
        // Admins can skip validation
        if (bypassValidation.value) {
            return true
        }
        
        // Clear any previous error messages
        errorMessage.value = ''
        
        // Loop through ALL fields in the form (not just current page)
        for (const field of formFields) {
            // Document uploads - check if files were uploaded
            if (field.type === 'document') {
                if (field.required && (!documents[field.id] || documents[field.id].length === 0)) {
                    errorMessage.value = `Please upload ${field.label}`
                    return false
                }
            } 
            // Multiselect fields - check if at least one option is selected
            else if (field.type === 'multiselect') {
                if (field.required && (!formData[field.key] || (formData[field.key] as any[]).length === 0)) {
                    errorMessage.value = `Please select at least one option for ${field.label}`
                    return false
                }
                // Special case: if they selected "other", make sure they filled in the other text field
                if (formData[field.key] && Array.isArray(formData[field.key]) && (formData[field.key] as string[]).includes('other')) {
                    const otherTextKey = `${field.key}Other`
                    const otherText = formData[otherTextKey] as string
                    if (!otherText || String(otherText).trim() === '') {
                        errorMessage.value = `Please specify your other option for ${field.label}`
                        return false
                    }
                }
            } 
            // Signature fields - need both the drawn signature AND typed name, plus consent
            else if (field.type === 'signature') {
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
            } 
            // Regular input fields (text, email, number, etc.)
            else {
                const fieldValue = formData[field.key]
                
                // First check if it's required and empty
                if (field.required && !fieldValue) {
                    errorMessage.value = `Please fill in ${field.label}`
                    return false
                }
                
                // Then check if it matches the pattern (if a pattern is defined)
                // This is where email regex, phone number patterns, etc. get validated
                if (fieldValue && field.pattern) {
                    if (!validatePattern(fieldValue, field.pattern)) {
                        errorMessage.value = `${field.label} format is invalid. Please check the format and try again.`
                        return false
                    }
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