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
            :form-type="selectedForm?.type as FormType"
            :form-title="selectedForm?.pageTitle || ''"
            :form-fields="getFormFields(selectedForm?.type as FormType)"
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
import type { OnboardingSubmission } from '../src/types/onboarding'
import type { FormType } from '../src/types/formTypes'
import {
    baseFields,
    agentFields,
    borrowerFields,
    // lenderFields,
    // supervisorFields,
    // partnerFields,
    // adminFields,
    type FormField
} from './formFields'
import './styles/Forms.css'

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
    // Temporarily disabled - focusing on Agent and Borrower only
    // { 
    //     name: 'Lender Onboarding', 
    //     type: 'lender',
    //     pageTitle: 'Lender Onboarding',
    //     pageContent: 'Lender Onboarding form content goes here.'
    // },
    // { 
    //     name: "Supervisor Onboarding",
    //     type: 'supervisor',
    //     pageTitle: 'Supervisor Onboarding',
    //     pageContent: 'Supervisor Onboarding form content goes here.',
    // },
    // { 
    //     name: "Admin Onboarding",
    //     type: 'admin',
    //     pageTitle: 'Admin Onboarding',
    //     pageContent: 'Admin Onboarding form content goes here.',
    // },
    // { 
    //     name: "Partner Onboarding",
    //     type: 'partner',
    //     pageTitle: 'Partner Onboarding',
    //     pageContent: 'Partner Onboarding form content goes here.',
    // },
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
    return formOptions.filter(form => formStorage.hasSavedForm(form.type as 'agent' | 'borrower'))
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
        formStorage.deleteSavedForm(formType as 'agent' | 'borrower')
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
        // Temporarily disabled - focusing on Agent and Borrower only
        // case 'lender':
        //     return [...baseFields, ...lenderFields]
        // case 'supervisor':
        //     return [...baseFields, ...supervisorFields]
        // case 'partner':
        //     return [...baseFields, ...partnerFields]
        // case 'admin':
        //     return [...baseFields, ...adminFields]
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
    
    // Check if user is admin for bypass
    let isAdmin = false
    const currentPhone = verificationState?.currentUserPhone.value
    
    if (currentPhone) {
        try {
            const { fetchTestUser } = await import('../src/config/testUsers')
            const user = await fetchTestUser(currentPhone)
            
            if (user && (user.isAdmin || user.bypassValidation)) {
                isAdmin = true
            }
        } catch (error) {
            console.error('Error fetching user for admin check:', error)
        }
    }
    
    // TODO: Replace with actual API call when backend is ready
    
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
            } catch (error) {
                console.warn('Error updating test user via API (non-critical):', error)
                // Non-critical - continue with form submission
            }
        }
        
        // Update in-memory verification state
        // Admin users can bypass form validation but still see verification screen
        // (They are NOT auto-verified, so they can test the verification flow)
        verificationState.updateSubmitted(submission.formType)
    }
    refreshKey.value++ // Trigger UI update
    return true
}
</script>