/**
 * Form initialization composable
 * 
 * Sets up the initial values for all form fields based on their type. This makes sure
 * every field has a default value when the form loads. Also handles resetting the form
 * back to initial state.
 * 
 * If you add a new field type, you'll need to add a condition here to set its default value.
 */
import { reactive, type Ref } from 'vue'

interface FormField {
    id: string
    key: string
    type: string
}

export function useFormInitialization<T extends FormField>(
    fields: T[],
    formData: Record<string, any>
) {
    /**
     * Sets up initial values for all form fields
     * 
     * Called when the form first loads. Each field type gets a different default:
     * - multiselect: empty array (and an empty "other" text field)
     * - checkbox: false
     * - signature: null (needs to be filled in)
     * - everything else: empty string
     * 
     * If you add a new field type, add a new condition here with its default value.
     */
    const initializeFormData = () => {
        fields.forEach(field => {
            if (field.type === 'multiselect') {
                // Multiselect needs an array for the selected options
                formData[field.key] = []
                // Also create a field for "other" text if they select "other" option
                formData[`${field.key}Other`] = ''
            } else if (field.type === 'checkbox') {
                // Checkboxes start as unchecked
                formData[field.key] = false
            } else if (field.type === 'signature') {
                // Signatures start as null until user signs
                formData[field.key] = null
            } else {
                // Everything else (text, email, number, etc.) starts as empty string
                formData[field.key] = ''
            }
        })
    }

    /**
     * Resets all form fields back to their initial values
     * 
     * This is basically the same as initializeFormData, but it's useful to have
     * a separate function for when users click "Reset Form". Same logic applies -
     * if you add a new field type, add it here too.
     */
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

