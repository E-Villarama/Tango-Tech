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
    formType: FormType
    formTitle: string
    formFields: FormField[]
    onSubmit: (submission: OnboardingSubmission) => Promise<boolean> | boolean
    loadSavedData?: boolean // Whether to load saved data on mount
}

const props = withDefaults(defineProps<Props>(), {
    loadSavedData: false
})

defineEmits<{
    goBack: []
}>()

const formData = reactive<OnboardingFormData>({})
const documents = reactive<Record<string, File[]>>({})
const errorMessage = ref('')
const successMessage = ref('')
const saveMessage = ref('')
const isSubmitting = ref(false)
const currentPage = ref(1)
const bypassValidation = ref(false)

// Inject verification state to get current user phone
const verificationState = inject<{
  currentUserPhone: { value: string | null }
}>('verificationState', {
  currentUserPhone: { value: null }
})

// Check if current user is admin and can bypass validation
const checkAdminStatus = async () => {
  const currentPhone = verificationState?.currentUserPhone.value
  
  if (currentPhone) {
    try {
      const user = await fetchTestUser(currentPhone)
      
      if (user && (user.isAdmin || user.bypassValidation)) {
        bypassValidation.value = true
      }
    } catch (error) {
      console.error('Error fetching user for admin check:', error)
    }
  }
}

// Use composables for form initialization
const { initializeFormData, resetFormData: resetFormDataFn } = useFormInitialization(props.formFields, formData)

// Initialize documents separately (not handled by composable)
props.formFields.forEach(field => {
    if (field.type === 'document') {
        documents[field.id] = []
    }
})

// Initialize form data
initializeFormData()

// Use composables for organized logic
const { fieldsByPage, totalPages, currentPageFields, reviewPages } = useFormFields(props.formFields, currentPage)
const { getRowClass, getRowStyle, getColumnClass, getFieldGridStyle, getInputHeightStyle } = useFormLayout()
const { isCurrentPageValid, validateForm } = useFormValidation({
    formFields: props.formFields,
    formData,
    documents,
    fieldsByPage,
    currentPage,
    bypassValidation,
    errorMessage
})
const { goToNextPage, goToPreviousPage, goToReviewPage, editSection } = useFormNavigation({
    currentPage,
    totalPages,
    isCurrentPageValid,
    bypassValidation,
    errorMessage
})

// Watch for when formFields change and ensure currentPage is valid
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

// Get select option label for review display
const getSelectOptionLabel = (field: FormField, value: string): string => {
    if (!value || !field.options) return ''
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
}

// Get section title for a given page (from section titles mapping)
const getPageSectionTitle = (pageNum: number): string => {
    return getSectionTitle(props.formType, pageNum)
}

// Review page sections
const reviewSections = computed(() => {
    return reviewPages.value.map(pageNum => {
        const pageFields = fieldsByPage.value[pageNum] || []
        const items = pageFields.map(field => {
            let value = 'Not answered'
            
            if (field.type === 'document') {
                const docFiles = documents[field.id]
                value = docFiles && docFiles.length > 0
                    ? `${docFiles.length} file(s) uploaded`
                    : 'No files uploaded'
            } else if (field.type === 'signature') {
                const sigData = formData[field.key]
                value = sigData && typeof sigData === 'object' && sigData !== null && 'consentGiven' in sigData && (sigData as any).consentGiven
                    ? '✓ Signed'
                    : 'Not signed'
            } else if (field.type === 'multiselect') {
                const multiselectValue = formData[field.key]
                // Type assertion: multiselect fields are always string arrays
                if (Array.isArray(multiselectValue) && multiselectValue.length > 0) {
                    const stringArray = multiselectValue as unknown as string[]
                    value = stringArray.join(', ')
                    const otherValue = formData[`${field.key}Other`]
                    if (stringArray.includes('other') && otherValue && typeof otherValue === 'string') {
                        value += ` (Other: ${otherValue})`
                    }
                }
            } else if (field.type === 'checkbox') {
                const checkboxValue = formData[field.key]
                value = checkboxValue ? 'Yes' : 'No'
            } else if (field.type === 'select') {
                const fieldValue = formData[field.key]
                value = getSelectOptionLabel(field, fieldValue ? String(fieldValue) : '') || 'Not answered'
            } else {
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

// Validate entire form (for review page)
const isFormValid = computed(() => {
    // Admin bypass: skip all validation
    if (bypassValidation.value) {
        return true
    }
    
    // Use validateForm from composable
    return validateForm()
})

// Load saved form data if requested and check admin status
onMounted(async () => {
    // Check if user is admin for bypass validation
    await checkAdminStatus()
    
    if (props.loadSavedData) {
        loadSavedForm()
    }
})

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

const saveProgress = () => {
    // Prepare document metadata (files can't be saved to localStorage)
    const documentMetadata: Record<string, Array<{ name: string; size: number; type: string }>> = {}
    
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
    
    saveMessage.value = `Progress saved! You're on page ${currentPage.value} of ${totalPages.value}.`
    setTimeout(() => {
        saveMessage.value = ''
    }, 3000)
}

// validateForm is now provided by useFormValidation composable

const handleSubmit = async () => {
    // If on review page, validate and submit
    if (currentPage.value === totalPages.value + 1) {
        if (!validateForm()) {
            return
        }
    } else {
        // If not on review page, go to review page instead
        goToReviewPage()
        return
    }
    
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    try {
        // Prepare document uploads from form fields
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
        
        const submission: OnboardingSubmission = {
            formType: props.formType,
            formData: { ...formData },
            documents: documentUploads,
            submittedAt: new Date()
        }
        
        // Call the parent's submit handler
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

// Watch for form type changes and reset to page 1
watch(() => props.formType, () => {
    currentPage.value = 1
})


// Layout utilities are now provided by useFormLayout composable

// Handle other text update from multiselect
const handleOtherTextUpdate = (fieldKey: string, text: string) => {
    const otherTextKey = `${fieldKey}Other`
    formData[otherTextKey] = text
}

// Handle signature update
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

