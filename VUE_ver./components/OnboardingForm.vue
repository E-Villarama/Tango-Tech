<template>
    <div class="form-container">
        <button class="btn btn-secondary mb-3 back-button" @click="$emit('goBack')">
            ← Back to Form Selection
        </button>
        
        <h1 class="form-title">{{ formTitle }}</h1>
        
        <!-- Page Progress Indicator -->
        <div v-if="totalPages > 1" class="page-progress mb-4">
            <div class="progress-bar">
                <div 
                    class="progress-fill" 
                    :style="{ width: `${(currentPage / totalPages) * 100}%` }"
                ></div>
            </div>
            <p class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</p>
        </div>
        
        <form @submit.prevent="handleSubmit">
            <!-- Debug: Show if no fields -->
            <div v-if="currentPageFields.length === 0" class="alert alert-info">
                <p><strong>Debug Info:</strong></p>
                <p>Total form fields: {{ formFields.length }}</p>
                <p>Current page: {{ currentPage }}</p>
                <p>Total pages: {{ totalPages }}</p>
                <p>Fields by page keys: {{ Object.keys(fieldsByPage).join(', ') }}</p>
                <p>Fields on current page: {{ fieldsByPage[currentPage]?.length || 0 }}</p>
            </div>
            
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
                                :accepted-types="field.acceptedTypes"
                                :max-size="field.maxSize"
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
                                    v-model="formData[field.key]"
                                    @update:other-text="handleOtherTextUpdate(field.key, $event)"
                                />
                                <template v-else>
                                    <label :for="field.id" class="form-label">
                                        {{ field.label }}
                                        <span v-if="field.required" class="text-danger">*</span>
                                    </label>
                                    <!-- Textarea Field -->
                                    <textarea
                                        v-if="field.type === 'textarea'"
                                        class="form-control"
                                        :id="field.id"
                                        v-model="formData[field.key]"
                                        :required="field.required"
                                        :placeholder="field.placeholder"
                                        :rows="field.rowSpan || 3"
                                        :pattern="field.pattern"
                                        :minlength="field.minlength"
                                    ></textarea>
                                    <!-- Select Field -->
                                    <select
                                        v-else-if="field.type === 'select'"
                                        class="form-select"
                                        :id="field.id"
                                        v-model="formData[field.key]"
                                        :required="field.required"
                                        :style="getInputHeightStyle(field)"
                                    >
                                        <option value="" disabled>{{ field.placeholder }}</option>
                                        <option
                                            v-for="option in field.options"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </option>
                                    </select>
                                    <!-- Input Field -->
                                    <input
                                        v-else-if="field.type !== 'file'"
                                        :type="field.type"
                                        class="form-control"
                                        :id="field.id"
                                        v-model="formData[field.key]"
                                        :required="field.required"
                                        :placeholder="field.placeholder"
                                        :pattern="field.pattern"
                                        :minlength="field.minlength"
                                        :style="getInputHeightStyle(field)"
                                    />
                                </template>
                            </template>
                        </div>
                    </template>
                </div>
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
            <div v-if="totalPages > 1" class="form-navigation">
                <button 
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="goToPreviousPage"
                    :disabled="currentPage === 1 || isSubmitting"
                >
                    ← Previous
                </button>
                
                <div class="navigation-actions">
                    <button 
                        v-if="currentPage < totalPages"
                        type="button"
                        class="btn btn-primary"
                        @click="goToNextPage"
                        :disabled="(!isCurrentPageValid && !bypassValidation) || isSubmitting"
                    >
                        Next →
                    </button>
                    <button 
                        v-else
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="isSubmitting"
                    >
                        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ isSubmitting ? 'Submitting...' : 'Submit Onboarding Form' }}
                    </button>
                </div>
            </div>
            
            <!-- Submit Button (for single page forms) -->
            <div v-if="totalPages === 1" class="form-actions">
                <button 
                    type="submit" 
                    class="btn btn-primary btn-submit"
                    :disabled="isSubmitting"
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
import { formStorage } from '../src/services/formStorage'
import { fetchTestUser } from '../src/config/testUsers'
import type { OnboardingFormData, DocumentRequirement, OnboardingSubmission } from '../src/types/onboarding'
import type { FormType } from '../src/types/formTypes'

interface FormField {
    id: string
    key: string
    label: string
    type: string // 'text', 'email', 'select', 'document', etc.
    placeholder: string
    required?: boolean
    pattern?: string
    minlength?: number
    options?: Array<{ value: string; label: string }> // For select fields
    columnSpan?: number // Bootstrap columns (1-12, default 12 for full width)
    rowSpan?: number // Number of rows to span (for textarea rows, or height multiplier)
    page?: number // Page number (default: 1) - allows splitting fields across pages
    // Document upload specific properties (only used when type === 'document')
    description?: string // Description for document uploads
    acceptedTypes?: string[] // e.g., ['image/jpeg', 'image/png', 'application/pdf']
    maxSize?: number // in bytes
}

interface Props {
    formType: 'agent' | 'borrower' | 'lender'
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
  console.log('OnboardingForm: Checking admin status for phone:', currentPhone)
  
  if (currentPhone) {
    try {
      const user = await fetchTestUser(currentPhone)
      console.log('OnboardingForm: Fetched user:', user)
      console.log('OnboardingForm: isAdmin:', user?.isAdmin, 'bypassValidation:', user?.bypassValidation)
      
      if (user && (user.isAdmin || user.bypassValidation)) {
        bypassValidation.value = true
        console.log('OnboardingForm: ✓ Admin bypass enabled - validation will be skipped')
      } else {
        console.log('OnboardingForm: ✗ User is not admin - validation required')
      }
    } catch (error) {
      console.error('OnboardingForm: Error fetching user for admin check:', error)
    }
  } else {
    console.log('OnboardingForm: No current user phone found for admin check')
  }
}

// Initialize form data and documents from formFields
props.formFields.forEach(field => {
    if (field.type === 'document') {
        documents[field.id] = []
    } else if (field.type === 'multiselect') {
        formData[field.key] = [] // Multiselect uses array
        formData[`${field.key}Other`] = '' // Initialize other text field
    } else if (field.type === 'signature') {
        formData[field.key] = null // Signature data object
    } else {
        formData[field.key] = ''
    }
})

// Group fields by page
const fieldsByPage = computed(() => {
    const pages: Record<number, FormField[]> = {}
    
    props.formFields.forEach(field => {
        const page = field.page || 1 // Default to page 1
        if (!pages[page]) {
            pages[page] = []
        }
        pages[page].push(field)
    })
    
    return pages
})

// Get total number of pages
const totalPages = computed(() => {
    const pageNumbers = Object.keys(fieldsByPage.value).map(Number)
    return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1
})

// Get fields for current page and group them into rows
const currentPageFields = computed(() => {
    const pageFields = fieldsByPage.value[currentPage.value] || []
    
    // Debug: Log if no fields found
    if (pageFields.length === 0 && props.formFields.length > 0) {
        console.warn('No fields found for current page:', {
            currentPage: currentPage.value,
            totalPages: totalPages.value,
            availablePages: Object.keys(fieldsByPage.value).map(Number),
            totalFields: props.formFields.length,
            sampleFields: props.formFields.slice(0, 3).map(f => ({ id: f.id, page: f.page }))
        })
    }
    
    return groupFieldsIntoRows(pageFields)
})

// Watch for when formFields change and ensure currentPage is valid
watch(() => props.formFields, () => {
    if (props.formFields.length === 0) return
    
    const availablePages = Object.keys(fieldsByPage.value).map(Number).sort((a, b) => a - b)
    if (availablePages.length > 0) {
        // If current page doesn't exist or is invalid, go to first available page
        if (!availablePages.includes(currentPage.value) || currentPage.value < 1) {
            currentPage.value = availablePages[0]
        }
    } else {
        // If we have fields but no pages (shouldn't happen), reset to page 1
        currentPage.value = 1
    }
}, { immediate: true })

// Group fields into rows (existing logic, but for a subset)
const groupFieldsIntoRows = (fields: FormField[]): FormField[][] => {
    const rows: FormField[][] = []
    let currentRow: FormField[] = []
    let currentRowSpan = 0
    
    fields.forEach(field => {
        const span = field.columnSpan || 12
        
        if (currentRowSpan + span > 12 && currentRow.length > 0) {
            rows.push([...currentRow])
            currentRow = []
            currentRowSpan = 0
        }
        
        currentRow.push(field)
        currentRowSpan += span
        
        if (currentRowSpan >= 12) {
            rows.push([...currentRow])
            currentRow = []
            currentRowSpan = 0
        }
    })
    
    if (currentRow.length > 0) {
        rows.push(currentRow)
    }
    
    return rows
}

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
            if (field.required && (!formData[field.key] || formData[field.key].length === 0)) {
                return false
            }
            // Check "other" text if needed
            if (formData[field.key] && formData[field.key].includes('other')) {
                const otherTextKey = `${field.key}Other`
                if (!formData[otherTextKey] || formData[otherTextKey].trim() === '') {
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

// Navigation functions
const goToNextPage = () => {
    if (currentPage.value < totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
        currentPage.value++
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = '' // Clear any error messages
    } else if (!isCurrentPageValid.value && !bypassValidation.value) {
        errorMessage.value = 'Please complete all required fields on this page before continuing.'
    }
}

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
        // Scroll to top of form
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = '' // Clear any error messages
    }
}

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
                formData[key] = saved.formData[key]
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
        if (field.type === 'document' && documents[field.id] && documents[field.id].length > 0) {
            documentMetadata[field.id] = documents[field.id].map(file => ({
                name: file.name,
                size: file.size,
                type: file.type
            }))
        }
    })
    
    // Save to storage with current page
    formStorage.saveForm(props.formType, formData, documentMetadata, currentPage.value)
    
    saveMessage.value = `Progress saved! You're on page ${currentPage.value} of ${totalPages.value}.`
    setTimeout(() => {
        saveMessage.value = ''
    }, 3000)
}

const validateForm = (): boolean => {
    // Admin bypass: skip all validation
    if (bypassValidation.value) {
        console.log('Admin bypass: Skipping form validation')
        return true
    }
    
    errorMessage.value = ''
    
    // Validate all fields (both input and document)
    for (const field of props.formFields) {
        if (field.type === 'document') {
            if (field.required && (!documents[field.id] || documents[field.id].length === 0)) {
                errorMessage.value = `Please upload ${field.label}`
                return false
            }
        } else if (field.type === 'multiselect') {
            if (field.required && (!formData[field.key] || formData[field.key].length === 0)) {
                errorMessage.value = `Please select at least one option for ${field.label}`
                return false
            }
            // Check if "other" is selected and otherText is required
            if (formData[field.key] && formData[field.key].includes('other')) {
                const otherTextKey = `${field.key}Other`
                if (!formData[otherTextKey] || formData[otherTextKey].trim() === '') {
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

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }
    
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''
    
    try {
        // Prepare document uploads from form fields
        const documentUploads = props.formFields
            .filter(field => field.type === 'document')
            .filter(field => documents[field.id] && documents[field.id].length > 0)
            .flatMap(field => 
                documents[field.id].map(file => ({
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
        } else if (field.type === 'multiselect') {
            formData[field.key] = []
            formData[`${field.key}Other`] = '' // Reset other text field
        } else if (field.type === 'signature') {
            formData[field.key] = null // Reset signature
        } else {
            formData[field.key] = ''
        }
    })
    
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


// Check if row should use CSS Grid (for dynamic height handling)
const shouldUseGrid = (row: FormField[]): boolean => {
    // Use grid if row has multiple fields (side-by-side) and any might have different heights
    // This ensures proper alignment when fields have varying heights
    if (row.length <= 1) return false
    
    // Use grid if any field has rowSpan, is a document, or is a textarea
    return row.some(field => 
        (field.rowSpan && field.rowSpan > 1) || 
        field.type === 'document' ||
        field.type === 'textarea'
    )
}

// Get row class - use CSS Grid for dynamic heights, Bootstrap row for simple layouts
const getRowClass = (row: FormField[]): string => {
    return shouldUseGrid(row) ? 'form-row-grid' : 'row g-3'
}

// Get row style for CSS Grid
const getRowStyle = (row: FormField[]): string => {
    if (!shouldUseGrid(row)) return ''
    
    // Mobile-first: single column on mobile, then grid on larger screens
    // Use CSS Grid with auto rows - fields will naturally take the space they need
    return `display: grid; grid-template-columns: 1fr; grid-auto-rows: min-content; gap: 0.75rem; align-items: start;`
}

// Get column class - Bootstrap for simple rows, grid for dynamic rows
// Mobile-first: col-12 (full width) by default, then responsive at md breakpoint
const getColumnClass = (field: FormField, row: FormField[]): string => {
    if (!shouldUseGrid(row)) {
        const span = field.columnSpan || 12
        // Mobile-first: full width on mobile, then use columnSpan at md breakpoint
        return `col-12 col-md-${span}`
    }
    return '' // CSS Grid handles columns via style
}

// Get field grid style for CSS Grid rows
const getFieldGridStyle = (field: FormField, row: FormField[]): string => {
    if (!shouldUseGrid(row)) return ''
    
    const columnSpan = field.columnSpan || 12
    const rowSpan = field.rowSpan || 1
    
    // Mobile-first: single column on mobile (handled by CSS)
    // Set CSS variable for column span to use in media queries
    const styles: string[] = []
    
    if (rowSpan > 1) {
        styles.push(`grid-row: span ${rowSpan}`)
    }
    
    // Set CSS variable for column span (used in desktop media query)
    styles.push(`--column-span: ${columnSpan}`)
    
    return styles.join('; ')
}

// Get input height style based on rowSpan (for non-grid rows)
const getInputHeightStyle = (field: FormField): string => {
    if (field.rowSpan && field.rowSpan > 1 && field.type !== 'textarea') {
        // Approximate height: ~2.5rem per row (including padding and border)
        const height = field.rowSpan * 2.5
        return `height: ${height}rem; resize: vertical;`
    }
    return ''
}

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
    formData[fieldKey] = signatureData
}
</script>

<style scoped>
/* Mobile-first: Base styles for mobile devices */
.form-container {
    width: 100%;
    padding: 1rem;
    margin: 0 auto;
}

.form-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    line-height: 1.3;
}

.back-button {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    min-height: 44px; /* Touch-friendly minimum */
}

.form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2rem;
}

.btn-submit,
.btn-action {
    width: 100%;
    padding: 0.875rem;
    font-size: 1rem;
    min-height: 44px; /* Touch-friendly minimum */
    border-radius: 0.375rem;
}

/* Form fields spacing */
.form-label {
    font-size: 0.9375rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.form-control,
.form-select {
    font-size: 1rem;
    padding: 0.75rem;
    min-height: 44px; /* Touch-friendly minimum */
    border-radius: 0.375rem;
}

/* CSS Grid for dynamic height rows - Mobile first */
.form-row-grid {
    display: grid;
    grid-template-columns: 1fr; /* Single column on mobile */
    grid-auto-rows: min-content;
    gap: 1rem;
    align-items: start;
}

/* Ensure fields align to top in grid */
.form-row-grid > div {
    display: flex;
    flex-direction: column;
}

/* Bootstrap row spacing on mobile */
.row.g-3 {
    margin-left: 0;
    margin-right: 0;
}

.row.g-3 > * {
    padding-left: 0;
    padding-right: 0;
    margin-bottom: 1rem;
}

/* Support for taller fields with rowSpan */
.form-control[style*="height"],
.form-select[style*="height"] {
    line-height: 1.5;
}

/* Tablet and up (768px+) */
@media (min-width: 768px) {
    .form-container {
        max-width: 800px;
        padding: 2rem;
    }

    .form-title {
        font-size: 2rem;
    }

    .back-button {
        width: auto;
        padding: 0.5rem 1rem;
    }

    .form-actions {
        flex-direction: row;
        flex-wrap: wrap;
    }

    .btn-submit,
    .btn-action {
        width: auto;
        flex: 1 1 auto;
    }

    /* CSS Grid: multi-column on tablet+ */
    .form-row-grid {
        grid-template-columns: repeat(12, 1fr);
        gap: 0.75rem;
    }

    /* Apply column spans on tablet+ for grid rows */
    .form-row-grid > div {
        grid-column: span var(--column-span, 12);
    }
}

/* Desktop (992px+) */
@media (min-width: 992px) {
    .form-container {
        padding: 2rem 3rem;
    }

    .form-title {
        font-size: 2.25rem;
    }
}

/* Page Progress Indicator */
.page-progress {
    margin-bottom: 2rem;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    background-color: #0d6efd;
    transition: width 0.3s ease;
}

.page-indicator {
    text-align: center;
    color: #6c757d;
    font-size: 0.875rem;
    margin: 0;
    font-weight: 500;
}

/* Form Navigation */
.form-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #dee2e6;
    gap: 1rem;
}

.navigation-actions {
    flex: 1;
    display: flex;
    justify-content: flex-end;
}

.form-navigation .btn {
    min-height: 44px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
}

/* Mobile adjustments for navigation */
@media (max-width: 767px) {
    .form-navigation {
        flex-direction: column;
    }
    
    .navigation-actions {
        width: 100%;
    }
    
    .form-navigation .btn {
        width: 100%;
    }
}
</style>

