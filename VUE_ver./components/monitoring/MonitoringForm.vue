<template>
    <div class="form-container">
        <BackButton label="Back to Dashboard" @click="goBack" />
        
        <h1 class="form-title">Submit Monitoring Form</h1>
        <h4> Agent ID: {{ agentId }}</h4> <!-- TODO: This will be handled by the backend -->
        
        <!-- Page Progress Indicator -->
        <ProgressBar 
            :current-page="currentPage" 
            :total-pages="totalPages"
        />
        
        <form @submit.prevent="handleSubmit">
            <!-- Review Page -->
            <ReviewPage
                v-if="currentPage === totalPages + 1"
                :sections="reviewSections"
            />

            <!-- Form Pages -->
            <template v-else>
                <!-- Borrower Selection & Location (Only on Page 1) -->
                <template v-if="currentPage === 1">
                    
                    <!--  

                    TODO: This will be for when we we've fixed assignment of borrowers to agents in the backend / through Admin dashboard 
                    
                    <div class="mb-3">
                        <label for="borrower-select" class="form-label">
                            Select Borrower <span class="text-danger">*</span>
                        </label>
                        <select
                            id="borrower-select"
                            v-model="selectedBorrowerId"
                            class="form-select"
                            :class="{ 'is-invalid': !selectedBorrowerId && touched }"
                            required
                            @blur="touched = true"
                        >
                            <option value="" disabled>Choose a borrower...</option>
                            <option
                                v-for="borrower in assignedBorrowers"
                                :key="borrower.id"
                                :value="borrower.id"
                            >
                                {{ borrower.name }}
                            </option>
                        </select>
                        <div v-if="!selectedBorrowerId && touched" class="invalid-feedback d-block">
                            Please select a borrower.
                        </div>
                    </div> -->

                    <!-- Location Status -->
                    <div class="mb-3">
                        <div class="alert" :class="locationStatus === 'success' ? 'alert-success' : locationStatus === 'error' ? 'alert-danger' : 'alert-info'">
                            <strong>Location:</strong>
                            <span v-if="locationStatus === 'loading'">Capturing location...</span>
                            <span v-else-if="locationStatus === 'success'">
                                ✓ Location captured: {{ locationData.latitude }}, {{ locationData.longitude }}
                            </span>
                            <span v-else-if="locationStatus === 'error'">
                                ⚠ Could not capture location. Please enable location services.
                            </span>
                            <span v-else>Location will be captured on form submission.</span>
                        </div>
                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            @click="captureLocation"
                            :disabled="locationStatus === 'loading'"
                        >
                            {{ locationStatus === 'success' ? 'Update Location' : 'Capture Location' }}
                        </button>
                    </div>
                </template>

                <!-- Dynamic Form Fields - Only show current page -->
                <template v-for="(row, rowIndex) in currentPageFieldsRows" :key="`row-${rowIndex}`">
                <div 
                    :class="getRowClass(row)"
                    class="mb-3"
                >
                    <template v-for="field in row" :key="field.id">
                        <div 
                            :class="getColumnClass(field, row)"
                            :style="getFieldGridStyle(field, row)"
                        >
                        <!-- Camera Upload Field -->
                        <CameraUpload
                            v-if="field.type === 'camera'"
                            :field-id="field.id"
                            :label="field.label"
                            :description="field.description"
                            :required="field.required"
                            :max-size="field.maxSize || 10 * 1024 * 1024"
                            :model-value="photos[field.id] || []"
                            @update:model-value="photos[field.id] = $event"
                        />
                        <!-- Signature Field -->
                        <signatureField
                            v-else-if="field.type === 'signature'"
                            :field-id="field.id"
                            :label="field.label"
                            :required="field.required"
                            @update:signature="handleSignatureUpdate(field.key, $event)"
                        />
                        <!-- Payment Field -->
                        <PaymentField
                            v-else-if="field.type === 'payment'"
                            :field-id="field.id"
                            :label="field.label"
                            :required="field.required"
                            @update:payment="handlePaymentUpdate(field.key, $event)"
                        />
                        <!-- Standard Form Fields -->
                        <FormFieldRenderer
                            v-else
                            :field="field"
                            v-model="formData[field.key]"
                            :touched="touched"
                            @blur="touched = true"
                        />
                        </div>
                    </template>
                </div>
                </template>
            </template>

            <!-- Form Navigation -->
            <FormNavigationButtons
                :current-page="currentPage"
                :total-pages="totalPages"
                :disabled="(!isCurrentPageValid && !bypassValidation)"
                :is-submitting="isSubmitting"
                :show-previous="currentPage > 1"
                submit-text="Submit Form"
                @previous="goToPreviousPage"
                @next="goToNextPage"
                @review="goToReviewPage"
                @submit="handleSubmit"
            />

            <div v-if="errorMessage" class="alert alert-danger mt-3">
                {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success mt-3">
                {{ successMessage }}
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, inject } from 'vue'
import type { MonitoringFormField, MonitoringSubmission } from '../../src/types/monitoring'
import { monitoringFields } from './monitoringFields'
import { fetchTestUser } from '../../src/config/testUsers'
import signatureField from '../SignatureField.vue'
import PaymentField from '../PaymentField.vue'
import ProgressBar from '../ProgressBar.vue'
import FormFieldRenderer from '../FormFieldRenderer.vue'
import CameraUpload from '../CameraUpload.vue'
import ReviewPage from '../ReviewPage.vue'
import { BackButton, FormNavigationButtons } from '../buttons'
import { useLocationCapture } from '../../src/composables/useLocationCapture'
import { useFormInitialization } from '../../src/composables/useFormInitialization'
import '../styles/monitoring/MonitoringForm.css'

interface Props {
    assignedBorrowers: Array<{ id: string; name: string }>
    agentId: string
}

interface Emits {
    (e: 'submit', submission: MonitoringSubmission): void
    (e: 'go-back'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedBorrowerId = ref('')
const formData = reactive<Record<string, any>>({})
const photos = reactive<Record<string, File[]>>({}) // Store camera uploads separately
const currentPage = ref(1)
const bypassValidation = ref(false)
const touched = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

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

// Use composables
const { locationStatus, locationData, captureLocation: captureLocationFn } = useLocationCapture()
const { initializeFormData, resetFormData } = useFormInitialization(monitoringFields, formData)

// Initialize form data
initializeFormData()

// Initialize photos storage for camera fields
monitoringFields.forEach(field => {
    if (field.type === 'camera') {
        photos[field.id] = []
    }
})

// Group fields by page
const fieldsByPage = computed(() => {
    const pages: Record<number, MonitoringFormField[]> = {}
    monitoringFields.forEach(field => {
        const page = field.page || 1
        if (!pages[page]) {
            pages[page] = []
        }
        pages[page].push(field)
    })
    return pages
})

const totalPages = computed(() => {
    const pageNumbers = Object.keys(fieldsByPage.value).map(Number)
    return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1
})

const currentPageFields = computed(() => {
    return fieldsByPage.value[currentPage.value] || []
})

// Get selected borrower name
const selectedBorrowerName = computed(() => {
    const borrower = props.assignedBorrowers.find(b => b.id === selectedBorrowerId.value)
    return borrower?.name || ''
})

// Get select option label
const getSelectOptionLabel = (field: MonitoringFormField, value: string): string => {
    if (!value || !field.options) return ''
    const option = field.options.find(opt => opt.value === value)
    return option?.label || value
}

// Review page sections
const reviewSections = computed(() => {
    const sections = [
        {
            title: 'Borrower Information',
            items: [
                {
                    label: 'Selected Borrower',
                    value: selectedBorrowerName.value || 'Not selected'
                }
            ],
            onEdit: () => editSection(1)
        },
        {
            title: 'Location',
            items: [
                {
                    label: 'Coordinates',
                    value: `${locationData.latitude}, ${locationData.longitude}`
                },
                {
                    label: 'Captured At',
                    value: new Date(locationData.timestamp).toLocaleString()
                }
            ],
            onEdit: () => editSection(1)
        },
        {
            title: 'Form Responses',
            items: monitoringFields.map(field => {
                let value = 'Not answered'
                if (field.type === 'camera') {
                    const photoFiles = photos[field.id]
                    value = photoFiles && photoFiles.length > 0
                        ? `${photoFiles.length} photo(s) uploaded`
                        : 'No photos uploaded'
                } else if (field.type === 'checkbox') {
                    value = formData[field.key] ? 'Yes' : 'No'
                } else if (field.type === 'select') {
                    value = getSelectOptionLabel(field, formData[field.key] || '') || 'Not answered'
                } else {
                    value = formData[field.key] || 'Not answered'
                }
                return {
                    label: field.label,
                    value
                }
            }),
            onEdit: () => editSection(1)
        }
    ]
    return sections
})


// Helper function to validate pattern
const validatePattern = (value: any, pattern?: string): boolean => {
    if (!pattern) return true
    if (value === null || value === undefined || value === '') return true
    
    const stringValue = String(value)
    try {
        const regex = new RegExp(pattern)
        return regex.test(stringValue)
    } catch (error) {
        console.warn('Invalid regex pattern:', pattern, error)
        return true
    }
}

// Validate current page only
const isCurrentPageValid = computed(() => {
    // Admin bypass: skip all validation
    if (bypassValidation.value) {
        return true
    }
    
    const pageFields = fieldsByPage.value[currentPage.value] || []
    
    for (const field of pageFields) {
        if (field.required) {
            if (field.type === 'camera') {
                // Check if photos were uploaded
                const photoFiles = photos[field.id]
                if (!photoFiles || photoFiles.length === 0) {
                    return false
                }
            } else if (field.type === 'checkbox') {
                if (!formData[field.key]) {
                    return false
                }
            } else {
                const fieldValue = formData[field.key]
                
                // Check if required field is filled
                if (!fieldValue || fieldValue === '') {
                    return false
                }
                
                // Check pattern validation if field has a value and pattern is defined
                if (fieldValue && field.pattern) {
                    if (!validatePattern(fieldValue, field.pattern)) {
                        return false
                    }
                }
            }
        }
    }
    return true
})

// Validate entire form (for submission)
const isFormValid = computed(() => {
    // Admin bypass: skip all validation
    if (bypassValidation.value) {
        return true
    }
    
    if (!selectedBorrowerId.value) return false
    if (locationStatus.value !== 'success') return false
    
    // Validate all pages
    for (const field of monitoringFields) {
        if (field.required) {
            if (field.type === 'camera') {
                // Check if photos were uploaded
                const photoFiles = photos[field.id]
                if (!photoFiles || photoFiles.length === 0) {
                    return false
                }
            } else if (field.type === 'checkbox') {
                if (!formData[field.key]) {
                    return false
                }
            } else if (field.type === 'payment') {
                if (!formData[field.key]) {
                    return false
                }
            } else {
                const fieldValue = formData[field.key]
                
                // Check if required field is filled
                if (!fieldValue || fieldValue === '') {
                    return false
                }
                
                // Check pattern validation if field has a value and pattern is defined
                if (fieldValue && field.pattern) {
                    if (!validatePattern(fieldValue, field.pattern)) {
                        return false
                    }
                }
            }
        }
    }
    return true
})

// Group fields into rows based on columnSpan (similar to OnboardingForm)
const currentPageFieldsRows = computed(() => {
    const fields = currentPageFields.value
    const rows: MonitoringFormField[][] = []
    let currentRow: MonitoringFormField[] = []
    let currentRowSpan = 0
    
    fields.forEach(field => {
        const columnSpan = field.columnSpan || 12
        
        // If adding this field would exceed 12 columns, start a new row
        if (currentRowSpan + columnSpan > 12 && currentRow.length > 0) {
            rows.push(currentRow)
            currentRow = [field]
            currentRowSpan = columnSpan
        } else {
            currentRow.push(field)
            currentRowSpan += columnSpan
        }
    })
    
    // Add the last row if it has fields
    if (currentRow.length > 0) {
        rows.push(currentRow)
    }
    
    return rows
})

// Get row class (use grid if multiple columns, otherwise regular row)
const getRowClass = (row: MonitoringFormField[]): string => {
    const totalSpan = row.reduce((sum, field) => sum + (field.columnSpan || 12), 0)
    if (totalSpan > 12 || row.length > 1) {
        return 'form-row-grid'
    }
    return 'row g-3'
}

// Get column class for field
const getColumnClass = (field: MonitoringFormField, row: MonitoringFormField[]): string => {
    const columnSpan = field.columnSpan || 12
    const totalSpan = row.reduce((sum, f) => sum + (f.columnSpan || 12), 0)
    
    // If using grid, return empty string (grid handles it via CSS variable)
    if (totalSpan > 12 || row.length > 1) {
        return ''
    }
    
    // Otherwise use Bootstrap columns
    return `col-md-${columnSpan}`
}

// Get field grid style for CSS Grid rows
const getFieldGridStyle = (field: MonitoringFormField, row: MonitoringFormField[]): string => {
    const totalSpan = row.reduce((sum, f) => sum + (f.columnSpan || 12), 0)
    if (totalSpan <= 12 && row.length === 1) return '' // Not using grid
    
    const columnSpan = field.columnSpan || 12
    const styles: string[] = []
    
    // Set CSS variable for column span (used in desktop media query)
    styles.push(`--column-span: ${columnSpan}`)
    
    return styles.join('; ')
}

// Navigation
const goToNextPage = () => {
    if (currentPage.value < totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
        currentPage.value++
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = ''
    } else if (!isCurrentPageValid.value && !bypassValidation.value) {
        touched.value = true
        errorMessage.value = 'Please complete all required fields on this page before continuing.'
    }
}

const goToReviewPage = () => {
    if (currentPage.value === totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
        currentPage.value = totalPages.value + 1 // Review page
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = ''
    } else if (!isCurrentPageValid.value && !bypassValidation.value) {
        touched.value = true
        errorMessage.value = 'Please complete all required fields on this page before continuing.'
    }
}

// Edit section - navigate to the relevant page while keeping form data
const editSection = (pageNumber: number) => {
    currentPage.value = pageNumber
    window.scrollTo({ top: 0, behavior: 'smooth' })
    errorMessage.value = ''
}

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = ''
    }
}

// Location capture wrapper with error handling
const captureLocation = async () => {
    try {
        await captureLocationFn()
        errorMessage.value = ''
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Error capturing location'
    }
}

// Auto-capture location when component mounts
onMounted(async () => {
    // Check if user is admin for bypass validation
    await checkAdminStatus()
    
    captureLocation()
    // Reset form
    selectedBorrowerId.value = ''
    currentPage.value = 1
    touched.value = false
    errorMessage.value = ''
    successMessage.value = ''
    resetFormData()
    
    // Reset photos
    monitoringFields.forEach(field => {
        if (field.type === 'camera') {
            photos[field.id] = []
        }
    })
})

// Form submission
const handleSubmit = async () => {
    // Admin bypass: skip validation
    if (!bypassValidation.value && !isFormValid.value) {
        touched.value = true
        errorMessage.value = 'Please complete all required fields and ensure location is captured.'
        return
    }
    
    // For admin bypass, use default borrower if none selected
    if (bypassValidation.value && !selectedBorrowerId.value && props.assignedBorrowers.length > 0) {
        selectedBorrowerId.value = props.assignedBorrowers[0]?.id || ''
    }
    
    // For admin bypass, capture location if not already captured
    if (bypassValidation.value) {
        if (locationStatus.value !== 'success' && locationStatus.value !== 'loading') {
            await captureLocation()
        }
        // If still not successful after capture attempt, use default coordinates
        if (locationStatus.value !== 'success') {
            locationData.latitude = 0
            locationData.longitude = 0
            locationData.timestamp = new Date().toISOString()
        }
    }

    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
        const borrower = props.assignedBorrowers.find(b => b.id === selectedBorrowerId.value)
        
        if (!borrower) {
            errorMessage.value = 'Please select a borrower.'
            isSubmitting.value = false
            return
        }
        
        // Include photos in form data
        const formDataWithPhotos = { ...formData }
        monitoringFields.forEach(field => {
            if (field.type === 'camera') {
                const photoFiles = photos[field.id]
                if (photoFiles && photoFiles.length > 0) {
                    formDataWithPhotos[field.key] = photoFiles.map((file) => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        lastModified: file.lastModified
                    }))
                }
            }
        })
        
        const submission: MonitoringSubmission = {
            borrowerId: selectedBorrowerId.value,
            borrowerName: borrower.name,
            agentId: props.agentId,
            formData: formDataWithPhotos,
            location: { ...locationData },
            submittedAt: new Date()
        }

        emit('submit', submission)
        
        successMessage.value = 'Form submitted successfully!'
        
        // Reset form after successful submission
        setTimeout(() => {
            goBack()
        }, 1500)
    } catch (error) {
        errorMessage.value = 'An error occurred while submitting the form. Please try again.'
        console.error('Form submission error:', error)
    } finally {
        isSubmitting.value = false
    }
}

const goBack = () => {
    emit('go-back')
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

// Handle payment update
const handlePaymentUpdate = (fieldKey: string, paymentData: {
    hasPaid: boolean
    amountPaid?: number | null
    receiptFiles?: File[]
    reasonNotPaid?: string
}) => {
    ;(formData as any)[fieldKey] = paymentData
}

</script>

