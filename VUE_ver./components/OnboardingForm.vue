<template>
    <div class="form-container">
        <BackButton label="Back to Form Selection" @click="$emit('goBack')" />
        
        <h1 class="form-title">{{ formTitle }}</h1>
        
        <!-- Page Progress Indicator -->
        <ProgressBar 
            :current-page="currentPage" 
            :total-pages="totalPages"
        />
        
        <!-- Section Title (Subtitle) -->
        <h2 v-if="currentPage !== totalPages + 1" class="section-subtitle mb-4">
            {{ getPageSectionTitle(currentPage) }}
        </h2>
        
        <form @submit.prevent="handleSubmit">
            <!-- Review Page -->
            <ReviewPage
                v-if="currentPage === totalPages + 1"
                :sections="reviewSections"
            />

            <!-- Form Pages -->
            <template v-else>
            <!-- Dynamic Form Fields - Only show current page -->
            <template v-for="(row, rowIndex) in currentPageFields" :key="`row-${rowIndex}`">
                <div 
                    :class="getRowClass(row)"
                    :style="getRowStyle(row)"
                    class="mb-3"
                >
                    <template v-for="field in row" :key="field.id">
                        <div 
                            :class="getColumnClass(field, row)"
                            :style="getFieldGridStyle(field, row)"
                        >
                            <!-- Document Upload Field -->
                            <FileUpload
                                v-if="field.type === 'document'"
                                :field-id="field.id"
                                :label="field.label"
                                :description="field.description"
                                :required="field.required"
                                :accepted-types="field.acceptedTypes || []"
                                :max-size="field.maxSize || 0"
                                :multiple="false"
                                v-model="documents[field.id]"
                            />
                            <!-- Input/Select Fields -->
                            <template v-else>
                                <!-- Signature Field (has its own label) -->
                                <SignatureField
                                    v-if="field.type === 'signature'"
                                    :field-id="field.id"
                                    :label="field.label"
                                    :required="field.required"
                                    @update:signature="handleSignatureUpdate(field.key, $event)"
                                />
                                <!-- Multiselect Field (has its own label) -->
                                <Multiselect
                                    v-else-if="field.type === 'multiselect'"
                                    :field-id="field.id"
                                    :label="field.label"
                                    :placeholder="field.placeholder"
                                    :required="field.required"
                                    :options="field.options || []"
                                    :model-value="Array.isArray(formData[field.key]) ? (formData[field.key] as unknown as string[]) : []"
                                    @update:model-value="(formData as any)[field.key] = $event"
                                    @update:other-text="handleOtherTextUpdate(field.key, $event)"
                                />
                                <FormFieldRenderer
                                    v-else
                                    :field="field"
                                    :model-value="(formData[field.key] as string | number | boolean) || (field.type === 'checkbox' ? false : '')"
                                    @update:model-value="(formData as any)[field.key] = $event"
                                    :input-style="getInputHeightStyle(field)"
                                />
                            </template>
                        </div>
                    </template>
                </div>
            </template>
            </template>
            
            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
            </div>
            
            <!-- Success Message -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
                {{ successMessage }}
            </div>
            
            <!-- Save Progress Message -->
            <div v-if="saveMessage" class="alert alert-info mt-3 mb-0" role="alert">
                {{ saveMessage }}
            </div>
            
            <!-- Navigation Buttons -->
            <FormNavigationButtons
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                :disabled="(!isCurrentPageValid && !bypassValidation)"
                :is-submitting="isSubmitting"
                submit-text="Submit Onboarding Form"
                @previous="goToPreviousPage"
                @next="goToNextPage"
                @review="goToReviewPage"
                @submit="handleSubmit"
            />
            
            <!-- Submit Button (for single page forms) -->
            <div v-if="totalPages === 1 && currentPage !== totalPages + 1" class="form-actions">
                <button 
                    type="button"
                    class="btn btn-primary btn-submit"
                    @click="goToReviewPage"
                    :disabled="(!isFormValid && !bypassValidation) || isSubmitting"
                >
                    Review →
                </button>
            </div>
            
            <!-- Submit Button (on review page for single page forms) -->
            <div v-if="totalPages === 1 && currentPage === totalPages + 1" class="form-actions">
                <button 
                    type="submit" 
                    class="btn btn-primary btn-submit"
                    :disabled="isSubmitting || (!isFormValid && !bypassValidation)"
                >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isSubmitting ? 'Submitting...' : 'Submit Onboarding Form' }}
                </button>
            </div>
            
            <!-- Save Progress Button (always visible) -->
            <div class="form-actions">
                <button 
                    type="button" 
                    class="btn btn-outline-primary btn-action"
                    @click="saveProgress"
                    :disabled="isSubmitting"
                >
                    💾 Save Progress
                </button>
                <button 
                    type="button" 
                    class="btn btn-outline-secondary btn-action"
                    @click="resetForm"
                    :disabled="isSubmitting"
                >
                    Reset Form
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
/**
 * OnboardingForm Component
 * 
 * This is the main form component that handles multi-page onboarding forms.
 * It supports different field types (text, select, document upload, signature, etc.),
 * page navigation, form validation, saving progress, and submission.
 * 
 * The component uses several composables to organize the logic:
 * - useFormFields: Organizes fields into pages and rows
 * - useFormLayout: Handles responsive layout (Bootstrap/Grid)
 * - useFormValidation: Validates form fields
 * - useFormNavigation: Handles page navigation
 * - useFormInitialization: Sets up initial form values
 * 
 * To modify form behavior, check the composables first - most logic is there.
 * To add a new field type, you'll need to:
 * 1. Add it to the template (like FileUpload, SignatureField, etc.)
 * 2. Handle it in useFormInitialization
 * 3. Handle it in useFormValidation
 * 4. Handle it in reviewSections if you want it on the review page
 */
import { ref, reactive, computed, onMounted, watch, inject } from 'vue'
import FileUpload from './FileUpload.vue'
import Multiselect from './Multiselect.vue'
import SignatureField from './SignatureField.vue'
import FormFieldRenderer from './FormFieldRenderer.vue'
import ReviewPage from './ReviewPage.vue'
import ProgressBar from './ProgressBar.vue'
import { BackButton, EditButton, SubmitButton, FormNavigationButtons, ActionButtons } from './buttons'
import { formStorage } from '../src/services/formStorage'
import { fetchTestUser } from '../src/config/testUsers'
import { getSectionTitle } from './formFields'
import { useFormValidation } from '../src/composables/useFormValidation'
import { useFormNavigation } from '../src/composables/useFormNavigation'
import { useFormLayout } from '../src/composables/useFormLayout'
import { useFormFields } from '../src/composables/useFormFields'
import { useFormInitialization } from '../src/composables/useFormInitialization'
import type { OnboardingFormData, DocumentRequirement, OnboardingSubmission } from '../src/types/onboarding'
import type { FormType } from '../src/types/formTypes'
import type { FormField } from './formFields/types'
import './styles/OnboardingForm.css'

interface Props {
    formType: FormType // Type of form (agent, borrower, etc.)
    formTitle: string // Title shown at top of form
    formFields: FormField[] // Array of field definitions
    onSubmit: (submission: OnboardingSubmission) => Promise<boolean> | boolean // Callback when form is submitted
    loadSavedData?: boolean // Whether to automatically load saved progress on mount
}

const props = withDefaults(defineProps<Props>(), {
    loadSavedData: false
})

defineEmits<{
    goBack: [] // Emitted when user clicks back button
}>()

// Reactive state
const formData = reactive<OnboardingFormData>({}) // All form field values
const documents = reactive<Record<string, File[]>>({}) // Uploaded files by field ID
const errorMessage = ref('') // Error message to display
const successMessage = ref('') // Success message to display
const saveMessage = ref('') // Save progress message
const isSubmitting = ref(false) // Whether form is currently submitting
const currentPage = ref(1) // Current page number (review page is totalPages + 1)
const bypassValidation = ref(false) // Admin bypass for validation

// Inject verification state to get current user phone (for admin check)
const verificationState = inject<{
  currentUserPhone: { value: string | null }
}>('verificationState', {
  currentUserPhone: { value: null }
})

/**
 * Checks if the current user is an admin and can bypass validation
 * 
 * This is useful for testing or special admin workflows. Admins can skip
 * validation and submit forms even if fields aren't filled.
 * 
 * To modify admin detection, edit the condition below or change how
 * we fetch user data.
 */
const checkAdminStatus = async () => {
  const currentPhone = verificationState?.currentUserPhone.value
  
  if (currentPhone) {
    try {
      const user = await fetchTestUser(currentPhone)
      
      // Enable bypass if user is admin or has bypassValidation flag
      if (user && (user.isAdmin || user.bypassValidation)) {
        bypassValidation.value = true
      }
    } catch (error) {
      console.error('Error fetching user for admin check:', error)
    }
  }
}

// Initialize form data structure using composable
const { initializeFormData, resetFormData: resetFormDataFn } = useFormInitialization(props.formFields, formData)

// Initialize document storage for each document field
// Documents are stored separately from formData because they're File objects
props.formFields.forEach(field => {
    if (field.type === 'document') {
        documents[field.id] = []
    }
})

// Set up initial values for all form fields
initializeFormData()

// Use composables to organize form logic
// These handle all the complex logic so the component stays clean

// Organize fields into pages and rows for layout
const { fieldsByPage, totalPages, currentPageFields, reviewPages } = useFormFields(props.formFields, currentPage)

// Handle responsive layout (Bootstrap columns vs CSS Grid)
const { getRowClass, getRowStyle, getColumnClass, getFieldGridStyle, getInputHeightStyle } = useFormLayout()

// Validate form fields (current page and entire form)
const { isCurrentPageValid, validateForm } = useFormValidation({
    formFields: props.formFields,
    formData,
    documents,
    fieldsByPage,
    currentPage,
    bypassValidation,
    errorMessage
})

// Handle page navigation (next, previous, review, edit)
const { goToNextPage, goToPreviousPage, goToReviewPage, editSection } = useFormNavigation({
    currentPage,
    totalPages,
    isCurrentPageValid,
    bypassValidation,
    errorMessage
})

/**
 * Watch for formFields changes and ensure current page is valid
 * 
 * If the form fields change (like switching form types), we need to make sure
 * the current page number is still valid. If not, jump to the first available page.
 */
watch(() => props.formFields, () => {
    if (props.formFields.length === 0) return
    
    const availablePages = Object.keys(fieldsByPage.value).map(Number).sort((a, b) => a - b)
    if (availablePages.length > 0) {
        // If current page doesn't exist or is invalid, go to first available page
        const firstPage = availablePages[0]
        if (firstPage !== undefined && (!availablePages.includes(currentPage.value) || currentPage.value < 1)) {
            currentPage.value = firstPage
        }
    } else {
        // If we have fields but no pages (shouldn't happen), reset to page 1
        currentPage.value = 1
    }
}, { immediate: true })

/**
 * Gets the display label for a select field option
 * 
 * Select fields store the option value, but we want to show the label on the review page.
 * This finds the option that matches the value and returns its label.
 */
const getSelectOptionLabel = (field: FormField, value: string): string => {
    if (!value || !field.options) return ''
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
}

/**
 * Gets the section title for a page
 * 
 * Uses the formFields index to get the section title mapping for this form type.
 */
const getPageSectionTitle = (pageNum: number): string => {
    return getSectionTitle(props.formType, pageNum)
}

/**
 * Builds the review page sections
 * 
 * This creates the data structure for the review page - groups fields by page
 * and formats their values for display. Each field type has its own formatting logic.
 * 
 * To modify how fields appear on the review page, edit the value formatting below.
 */
const reviewSections = computed(() => {
    return reviewPages.value.map(pageNum => {
        const pageFields = fieldsByPage.value[pageNum] || []
        const items = pageFields.map(field => {
            let value = 'Not answered'
            
            // Format value based on field type for review display
            if (field.type === 'document') {
                // Show count of uploaded files
                const docFiles = documents[field.id]
                value = docFiles && docFiles.length > 0
                    ? `${docFiles.length} file(s) uploaded`
                    : 'No files uploaded'
            } else if (field.type === 'signature') {
                // Check if signature was provided and consent was given
                const sigData = formData[field.key]
                value = sigData && typeof sigData === 'object' && sigData !== null && 'consentGiven' in sigData && (sigData as any).consentGiven
                    ? '✓ Signed'
                    : 'Not signed'
            } else if (field.type === 'multiselect') {
                // Join selected options with commas, include "other" text if selected
                const multiselectValue = formData[field.key]
                // Type assertion: multiselect fields are always string arrays
                if (Array.isArray(multiselectValue) && multiselectValue.length > 0) {
                    const stringArray = multiselectValue as unknown as string[]
                    value = stringArray.join(', ')
                    // If "other" was selected, append the other text
                    const otherValue = formData[`${field.key}Other`]
                    if (stringArray.includes('other') && otherValue && typeof otherValue === 'string') {
                        value += ` (Other: ${otherValue})`
                    }
                }
            } else if (field.type === 'checkbox') {
                // Show Yes/No for checkboxes
                const checkboxValue = formData[field.key]
                value = checkboxValue ? 'Yes' : 'No'
            } else if (field.type === 'select') {
                // Show the option label, not the value
                const fieldValue = formData[field.key]
                value = getSelectOptionLabel(field, fieldValue ? String(fieldValue) : '') || 'Not answered'
            } else {
                // Regular text/number fields - just convert to string
                const fieldValue = formData[field.key]
                value = fieldValue ? String(fieldValue) : 'Not answered'
            }
            
            return {
                label: field.label,
                value
            }
        })
        
        return {
            title: getPageSectionTitle(pageNum),
            items,
            onEdit: () => editSection(pageNum)
        }
    })
})

/**
 * Validates the entire form (used on review page)
 * 
 * This checks all pages, not just the current one. Used to determine if
 * the submit button should be enabled.
 */
const isFormValid = computed(() => {
    // Admins can skip validation
    if (bypassValidation.value) {
        return true
    }
    
    // Use validateForm from composable
    return validateForm()
})

/**
 * Component mounted lifecycle hook
 * 
 * Runs when component first loads. Checks if user is admin (for bypass validation)
 * and optionally loads saved form data if loadSavedData prop is true.
 */
onMounted(async () => {
    // Check if user is admin for bypass validation
    await checkAdminStatus()
    
    // Load saved progress if requested
    if (props.loadSavedData) {
        loadSavedForm()
    }
})

/**
 * Loads saved form data from localStorage
 * 
 * Restores form field values and current page number. Note that files cannot
 * be restored (localStorage limitation), so users will need to re-upload documents.
 * 
 * Shows a message to the user indicating the form was loaded and which page they're on.
 */
const loadSavedForm = () => {
    const saved = formStorage.getSavedForm(props.formType)
    if (saved) {
        // Load form data
        Object.keys(saved.formData).forEach(key => {
            if (formData.hasOwnProperty(key)) {
                const savedValue = saved.formData[key]
                if (savedValue !== undefined) {
                    formData[key] = savedValue
                }
            }
        })
        
        // Restore current page if saved
        if (saved.currentPage && saved.currentPage <= totalPages.value) {
            currentPage.value = saved.currentPage
        }
        
        // Note: Files cannot be restored from localStorage
        // Document metadata is saved but files need to be re-uploaded
        if (Object.keys(saved.documentMetadata).length > 0) {
            saveMessage.value = `Form data loaded. You're on page ${currentPage.value} of ${totalPages.value}. Note: Files need to be re-uploaded.`
        } else {
            saveMessage.value = `Saved form data loaded. You're on page ${currentPage.value} of ${totalPages.value}.`
        }
        
        // Clear message after 5 seconds
        setTimeout(() => {
            saveMessage.value = ''
        }, 5000)
    }
}

/**
 * Saves form progress to localStorage
 * 
 * Saves all form field values and document metadata (name, size, type - not the actual files).
 * Also saves the current page number so users can resume where they left off.
 * 
 * Note: Files themselves cannot be saved to localStorage. Users will need to re-upload
 * files when they continue. If you need to save actual files, consider IndexedDB or
 * wait for backend API integration.
 */
const saveProgress = () => {
    // Prepare document metadata (files can't be saved to localStorage)
    const documentMetadata: Record<string, Array<{ name: string; size: number; type: string }>> = {}
    
    // Extract metadata for each document field
    props.formFields.forEach(field => {
        if (field.type === 'document') {
            const docFiles = documents[field.id]
            if (docFiles && docFiles.length > 0) {
                documentMetadata[field.id] = docFiles.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                }))
            }
        }
    })
    
    // Save to storage with current page
    formStorage.saveForm(props.formType, formData, documentMetadata, currentPage.value)
    
    // Show success message
    saveMessage.value = `Progress saved! You're on page ${currentPage.value} of ${totalPages.value}.`
    setTimeout(() => {
        saveMessage.value = ''
    }, 3000)
}

/**
 * Handles form submission
 * 
 * If not on review page, navigates to review page. If on review page, validates
 * the form and submits it. Prepares document uploads and calls the parent's
 * onSubmit callback.
 * 
 * To modify submission behavior, edit the submission object structure or the
 * error handling below.
 */
const handleSubmit = async () => {
    // If not on review page, go to review page instead of submitting
    if (currentPage.value !== totalPages.value + 1) {
        goToReviewPage()
        return
    }
    
    // On review page - validate before submitting
    if (!validateForm()) {
        return
    }
    
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    try {
        // Prepare document uploads from form fields
        // Maps each document field to an array of file objects with field ID
        const documentUploads = props.formFields
            .filter(field => field.type === 'document')
            .map(field => {
                const docFiles = documents[field.id]
                return docFiles && docFiles.length > 0 ? { field, files: docFiles } : null
            })
            .filter((item): item is { field: FormField; files: File[] } => item !== null)
            .flatMap(({ field, files }) => 
                files.map(file => ({
                    id: field.id,
                    name: file.name,
                    file: file
                }))
            )
        
        // Build submission object
        const submission: OnboardingSubmission = {
            formType: props.formType,
            formData: { ...formData }, // Copy to avoid mutating original
            documents: documentUploads,
            submittedAt: new Date()
        }
        
        // Call the parent's submit handler (usually makes API call)
        const success = await props.onSubmit(submission)
        
        if (success) {
            successMessage.value = 'Form submitted successfully!'
            // Clear saved form after successful submission
            formStorage.deleteSavedForm(props.formType)
            // Optionally reset form after successful submission
            // resetForm()
        } else {
            errorMessage.value = 'Form submission failed. Please try again.'
        }
    } catch (error) {
        errorMessage.value = 'An error occurred while submitting the form. Please try again.'
        console.error('Form submission error:', error)
    } finally {
        isSubmitting.value = false
    }
}

/**
 * Resets the form to initial state
 * 
 * Clears all form data, documents, and resets to page 1. If there's saved progress,
 * asks user if they want to delete it too.
 */
const resetForm = () => {
    // Confirm before resetting if there's saved data
    const hasSaved = formStorage.hasSavedForm(props.formType)
    
    if (hasSaved) {
        const confirmed = confirm('This will clear your current progress. Do you want to also delete your saved form?')
        if (confirmed) {
            formStorage.deleteSavedForm(props.formType)
        }
    }
    
    // Reset form data and documents
    props.formFields.forEach(field => {
        if (field.type === 'document') {
            documents[field.id] = []
        }
    })
    resetFormDataFn()
    
    // Reset to first page
    currentPage.value = 1
    
    errorMessage.value = ''
    successMessage.value = ''
    saveMessage.value = ''
}

/**
 * Watch for form type changes and reset to page 1
 * 
 * If the form type changes (like switching from agent to borrower form),
 * reset to the first page.
 */
watch(() => props.formType, () => {
    currentPage.value = 1
})

/**
 * Handles "other" text updates from multiselect fields
 * 
 * When a multiselect field has an "other" option and user selects it,
 * they need to fill in a text field. This stores that text in a separate
 * field with the key pattern: `${fieldKey}Other`
 * 
 * @param fieldKey - The key of the multiselect field
 * @param text - The "other" text value
 */
const handleOtherTextUpdate = (fieldKey: string, text: string) => {
    const otherTextKey = `${fieldKey}Other`
    formData[otherTextKey] = text
}

/**
 * Handles signature field updates
 * 
 * Signature fields return a complex object with the signature image, typed name,
 * consent status, etc. This stores that entire object in the form data.
 * 
 * @param fieldKey - The key of the signature field
 * @param signatureData - The signature data object from SignatureField component
 */
const handleSignatureUpdate = (fieldKey: string, signatureData: {
    signatureImage: string
    typedName: string
    signatureMode: 'both'
    consentGiven: boolean
    signedAt: string
}) => {
    // Type assertion needed because OnboardingFormData doesn't explicitly allow signature objects
    ;(formData as any)[fieldKey] = signatureData
}
</script>

