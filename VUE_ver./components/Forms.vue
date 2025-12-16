<template>
    <div class="container mt-4">
        <!-- Awaiting Verification Screen -->
        <AwaitingVerification v-if="hasSubmittedForm && !isVerified" />
        
        <!-- Form Selection Grid (only if no submitted form and not verified) -->
        <div v-else-if="!selectedForm && !isVerified" class="forms-container">
            <!-- Saved Forms Section (Priority) - Only show if saved forms exist -->
            <div v-if="hasAnySavedForms" class="saved-forms-section">
                <h2 class="section-title">
                    <span class="section-icon">📋</span>
                    Continue Your Form
                </h2>
                <p class="section-subtitle">You have saved progress. Continue where you left off or delete to start fresh.</p>
                <div class="saved-forms-grid">
                    <div 
                        v-for="form in formOptionsWithSaved" 
                        :key="form.type"
                        class="saved-form-card"
                    >
                        <div class="saved-form-header">
                            <h3 class="saved-form-title">{{ form.name }}</h3>
                            <span class="saved-badge">Saved</span>
                        </div>
                        <div class="saved-form-actions">
                            <button
                                class="btn btn-primary btn-continue"
                                @click="selectForm(form, true)"
                            >
                                <span class="btn-icon">▶</span>
                                Continue Form
                            </button>
                            <button
                                class="btn btn-outline-danger btn-delete"
                                @click="deleteSavedForm(form.type)"
                            >
                                <span class="btn-icon">🗑</span>
                                Delete Saved Form
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- New Forms Section - Only show if NO saved forms exist -->
            <div v-else class="new-forms-section">
                <h2 class="section-title">
                    <span class="section-icon">➕</span>
                    Start New Onboarding
                </h2>
                <p class="section-subtitle">Select a form type to begin your onboarding process.</p>
                <div class="new-forms-grid">
                    <button
                        v-for="(form, index) in formOptions" 
                        :key="index"
                        class="new-form-button"
                        @click="selectForm(form, false)"
                    >
                        <span class="form-name">{{ form.name }}</span>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Form Content -->
        <OnboardingForm
            v-else
            :form-type="selectedForm?.type as 'agent' | 'borrower' | 'lender'"
            :form-title="selectedForm?.pageTitle || ''"
            :form-fields="getFormFields(selectedForm?.type as 'agent' | 'borrower' | 'lender')"
            :on-submit="handleFormSubmitWithRefresh"
            :load-saved-data="loadSavedData"
            @go-back="goBack"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import OnboardingForm from './OnboardingForm.vue'
import AwaitingVerification from './AwaitingVerification.vue'
import { formStorage } from '../src/services/formStorage'
import type { OnboardingSubmission, DocumentRequirement } from '../src/types/onboarding'
import type { FormType } from '../src/types/formTypes'
import {
    baseFields,
    agentFields,
    borrowerFields,
    lenderFields,
    supervisorFields,
    partnerFields,
    adminFields,
    type FormField
} from './formFields'

// Inject verification state from App.vue
const verificationState = inject<{
  state: { value: { submittedFormType: FormType | null; verified: boolean } }
  currentUserPhone: { value: string | null }
  updateSubmitted: (formType: FormType) => void
  updateVerified: (verified: boolean) => void
  hasSubmittedForm: { value: boolean }
}>('verificationState')

interface FormOption {
    name: string
    type: string
    pageTitle: string
    pageContent: string
}

// FormField type is now imported from formFields/types.ts

const selectedForm = ref<FormOption | null>(null)
const loadSavedData = ref(false)
const refreshKey = ref(0) // Force reactivity for saved form checks

// Check if user is verified (should not see forms)
const isVerified = computed(() => {
    return verificationState?.state.value.verified === true
})

// Check if user has submitted a form (awaiting verification)
const hasSubmittedForm = computed(() => {
    return verificationState?.hasSubmittedForm.value === true
})

const formOptions: FormOption[] = [
    { 
        name: 'Agent Onboarding', 
        type: 'agent',
        pageTitle: 'Agent Onboarding',
        pageContent: 'Agent Onboarding form content goes here.'
    },
    { 
        name: 'Borrower Onboarding', 
        type: 'borrower',
        pageTitle: 'Borrower Onboarding',
        pageContent: 'Borrower Onboarding form content goes here.'
    },
    { 
        name: 'Lender Onboarding', 
        type: 'lender',
        pageTitle: 'Lender Onboarding',
        pageContent: 'Lender Onboarding form content goes here.'
    },
    {
        name: "Supervisor Onboarding",
        type: 'supervisor',
        pageTitle: 'Supervisor Onboarding',
        pageContent: 'Supervisor Onboarding form content goes here.',
    },
    {
        name: "Admin Onboarding",
        type: 'admin',
        pageTitle: 'Admin Onboarding',
        pageContent: 'Admin Onboarding form content goes here.',
    },
    {   
        name: "Partner Onboarding",
        type: 'partner',
        pageTitle: 'Partner Onboarding',
        pageContent: 'Partner Onboarding form content goes here.',
    },
]

const selectForm = (form: FormOption, continueSaved: boolean = false) => {
    selectedForm.value = form
    loadSavedData.value = continueSaved
}

// Check if any saved forms exist
const hasAnySavedForms = computed(() => {
    // Access refreshKey to make it reactive
    const _ = refreshKey.value
    return formOptions.some(form => formStorage.hasSavedForm(form.type as 'agent' | 'borrower' | 'lender'))
})

// Get forms that have saved data
const formOptionsWithSaved = computed(() => {
    // Access refreshKey to make it reactive
    const _ = refreshKey.value
    return formOptions.filter(form => formStorage.hasSavedForm(form.type as 'agent' | 'borrower' | 'lender'))
})


const goBack = () => {
    selectedForm.value = null
    loadSavedData.value = false
    // Force reactivity update to refresh saved forms display
    refreshKey.value++
}

// Check if saved forms exist (with reactivity)
const hasSavedForm = (formType: string): boolean => {
    // Access refreshKey to make it reactive
    refreshKey.value
    return formStorage.hasSavedForm(formType as 'agent' | 'borrower' | 'lender')
}

const deleteSavedForm = (formType: string) => {
    if (confirm('Are you sure you want to delete your saved form? This cannot be undone.')) {
        formStorage.deleteSavedForm(formType as 'agent' | 'borrower' | 'lender')
        // Force reactivity update
        refreshKey.value++
    }
}

// Watch for form submission to refresh saved form status
const handleFormSubmitWithRefresh = async (submission: OnboardingSubmission): Promise<boolean> => {
    const result = await handleFormSubmit(submission)
    if (result) {
        // Form submitted successfully, refresh to update UI
        refreshKey.value++
    }
    return result
}

// Define form fields for each onboarding type
const getFormFields = (formType: string): FormField[] => {
    switch (formType) {
        case 'agent':
            return [...baseFields, ...agentFields]
        case 'borrower':
            return [...baseFields, ...borrowerFields]
        case 'lender':
            return [...baseFields, ...lenderFields]
        case 'supervisor':
            return [...baseFields, ...supervisorFields]
        case 'partner':
            return [...baseFields, ...partnerFields]
        case 'admin':
            return [...baseFields, ...adminFields]
        default:
            return baseFields
    }
}

/* // Define document requirements for each onboarding type [Obsolete]
const getDocumentRequirements = (formType: string): DocumentRequirement[] => {
    const commonDocs: DocumentRequirement[] = [
        {
            id: 'idDocument',
            label: 'Government ID',
            description: 'Upload a valid government-issued ID (Driver\'s License, Passport, etc.)',
            required: true,
            acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
            maxSize: 5 * 1024 * 1024 // 5MB
        }
    ]
    
    if (formType === 'agent') {
        return [
            ...commonDocs,
            {
                id: 'licenseDocument',
                label: 'Real Estate License',
                description: 'Upload your real estate license document',
                required: true,
                acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                maxSize: 5 * 1024 * 1024 // 5MB
            },
            {
                id: 'backgroundCheck',
                label: 'Background Check',
                description: 'Upload background check document',
                required: false,
                acceptedTypes: ['application/pdf'],
                maxSize: 5 * 1024 * 1024 // 5MB
            }
        ]
    } else if (formType === 'borrower') {
        return [
            ...commonDocs,
            {
                id: 'proofOfIncome',
                label: 'Proof of Income',
                description: 'Upload proof of income (pay stubs, bank statements, etc.)',
                required: true,
                acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                maxSize: 10 * 1024 * 1024 // 10MB
            },
            {
                id: 'creditReport',
                label: 'Credit Report',
                description: 'Upload your credit report (optional)',
                required: false,
                acceptedTypes: ['application/pdf'],
                maxSize: 5 * 1024 * 1024 // 5MB
            }
        ]
    } else if (formType === 'lender') {
        return [
            ...commonDocs,
            {
                id: 'businessLicense',
                label: 'Business License',
                description: 'Upload your business license',
                required: true,
                acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                maxSize: 5 * 1024 * 1024 // 5MB
            },
            {
                id: 'financialStatement',
                label: 'Financial Statement',
                description: 'Upload financial statement or proof of capital',
                required: true,
                acceptedTypes: ['application/pdf'],
                maxSize: 10 * 1024 * 1024 // 10MB
            }
        ]
    }
    
    return commonDocs
} */


// Handle form submission
// TODO: Replace with actual API call when database is connected
const handleFormSubmit = async (submission: OnboardingSubmission): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Form submission:', submission)
    
    // Check if user is admin for bypass
    let isAdmin = false
    const currentPhone = verificationState?.currentUserPhone.value
    console.log('Checking admin status for phone:', currentPhone)
    
    if (currentPhone) {
        try {
            const { fetchTestUser } = await import('../src/config/testUsers')
            const user = await fetchTestUser(currentPhone)
            console.log('Admin check - Fetched user:', user)
            console.log('Admin check - isAdmin:', user?.isAdmin, 'bypassValidation:', user?.bypassValidation)
            
            if (user && (user.isAdmin || user.bypassValidation)) {
                isAdmin = true
                console.log('✓ Admin user detected - enabling bypass')
            } else {
                console.log('✗ User is not admin')
            }
        } catch (error) {
            console.error('Error fetching user for admin check:', error)
        }
    } else {
        console.log('No current user phone found for admin check')
    }
    
    // TODO: Replace with actual API call
    // Example:
    // const formData = new FormData()
    // 
    // // Add form data
    // Object.entries(submission.formData).forEach(([key, value]) => {
    //     formData.append(key, String(value))
    // })
    // 
    // // Add documents
    // submission.documents.forEach((doc, index) => {
    //     formData.append(`document_${index}`, doc.file)
    //     formData.append(`document_${index}_name`, doc.name)
    //     formData.append(`document_${index}_type`, doc.id)
    // })
    // 
    // const response = await fetch('/api/onboarding/submit', {
    //     method: 'POST',
    //     body: formData
    // })
    // 
    // if (response.ok) {
    //     // Update verification state via injected state
    //     // verificationState.updateSubmitted(submission.formType)
    //     return true
    // }
    // return false
    
    // Update in-memory verification state
    if (verificationState) {
        // Automatically update test user via API first
        if (verificationState.currentUserPhone.value) {
            try {
                const { updateTestUser } = await import('../src/config/testUsers')
                
                // Admin can bypass form validation but still goes through verification screen
                // (Set verified: false so they see the verification screen for testing)
                const updates = {
                    submittedFormType: submission.formType,
                    verified: false // Admin sees verification screen (not auto-verified)
                }
                
                await updateTestUser(verificationState.currentUserPhone.value, updates)
                console.log('✓ Test user updated via API', isAdmin ? '(Admin: Auto-verified)' : '')
                console.log('Updates applied:', updates)
            } catch (error) {
                console.warn('Error updating test user via API (non-critical):', error)
                // Non-critical - continue with form submission
            }
        }
        
        // Update in-memory verification state
        // Admin users can bypass form validation but still see verification screen
        // (They are NOT auto-verified, so they can test the verification flow)
        verificationState.updateSubmitted(submission.formType)
        
        if (isAdmin) {
            console.log('Admin bypass: Form submitted, but NOT auto-verified - will show verification screen', {
                submittedFormType: verificationState.state.value.submittedFormType,
                verified: verificationState.state.value.verified
            })
        }
    }
    refreshKey.value++ // Trigger UI update
    return true
}
</script>

<style scoped>
/* Mobile-first: Forms Container */
.forms-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
}

/* Section Titles */
.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    line-height: 1.3;
}

.section-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.section-subtitle {
    color: #6c757d;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    line-height: 1.5;
}

.warning-text {
    color: #dc3545;
    font-weight: 500;
}

/* Saved Forms Section (Priority) */
.saved-forms-section {
    margin-bottom: 0;
    padding: 0;
}

.saved-forms-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

.saved-form-card {
    background: white;
    border-radius: 0.75rem;
}

.saved-form-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.875rem;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.saved-form-title {
    font-size: 1rem;
    font-weight: 600;
    color: #212529;
    margin: 0;
    flex: 1;
    min-width: 0;
    line-height: 1.4;
}

.saved-badge {
    background: #0d6efd;
    color: white;
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.25rem 0.625rem;
    border-radius: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space: nowrap;
    flex-shrink: 0;
}

.saved-form-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.btn-continue,
.btn-delete {
    width: 100%;
    min-height: 44px;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
    font-weight: 500;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-continue {
    background: #0d6efd;
    border: none;
    color: white;
}

.btn-continue:hover {
    background: #0b5ed7;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(13, 110, 253, 0.3);
}

.btn-delete {
    background: white;
    border: 1px solid #dc3545;
    color: #dc3545;
}

.btn-delete:hover {
    background: #dc3545;
    color: white;
}

.btn-icon {
    font-size: 0.875rem;
}

/* New Forms Section */
.new-forms-section {
    padding: 0;
}

.new-forms-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
}

.new-form-button {
    background: white;
    border: 2px solid #dee2e6;
    border-radius: 0.75rem;
    padding: 1rem 1.25rem;
    min-height: 60px;
    font-size: 1rem;
    font-weight: 500;
    color: #212529;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
}

.new-form-button:hover {
    border-color: #0d6efd;
    background: #f8f9ff;
    transform: translateX(4px);
    box-shadow: 0 2px 4px rgba(13, 110, 253, 0.1);
}

.form-name {
    font-weight: 600;
}

/* Tablet and up (768px+) */
@media (min-width: 768px) {
    .forms-container {
        padding: 2rem;
    }

    .section-title {
        font-size: 1.75rem;
    }

    .section-icon {
        font-size: 2rem;
    }

    .section-subtitle {
        font-size: 1rem;
        margin-bottom: 1.5rem;
    }

    .saved-forms-section {
        padding: 0;
    }

    .saved-form-card {
        padding: 1.25rem;
    }

    .saved-form-title {
        font-size: 1.125rem;
    }

    .saved-badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.75rem;
    }

    .btn-continue,
    .btn-delete {
        padding: 0.75rem 1rem;
        font-size: 1rem;
    }

    .saved-forms-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .saved-form-actions {
        flex-direction: row;
    }

    .btn-continue,
    .btn-delete {
        flex: 1;
        width: auto;
    }

    .new-forms-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .new-form-button {
        min-height: 70px;
        font-size: 1.0625rem;
    }
}

/* Desktop (992px+) */
@media (min-width: 992px) {
    .saved-forms-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .new-forms-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .new-form-button {
        min-height: 80px;
        font-size: 1.125rem;
    }
}
</style>