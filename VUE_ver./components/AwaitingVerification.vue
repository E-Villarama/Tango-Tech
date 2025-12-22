<template>
    <div class="awaiting-verification-container">
        <div class="verification-card">
            <div class="card-content">
                <div class="spinner-wrapper">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
                
                <h2 class="verification-title">Awaiting Verification</h2>
                
                <p class="verification-message">
                    Your {{ submittedFormType }} onboarding form has been submitted and is currently under review.
                </p>
                
                <div class="status-alert">
                    <strong>Status:</strong> 
                    <span v-if="verificationStatus">
                        Submitted on {{ formatDate(verificationStatus.submittedAt) }}
                    </span>
                    <span v-else> Pending Review</span>
                </div>
                
                <div class="instructions">
                    <p>
                        You will be notified once your application has been verified. 
                        Until then, you cannot submit additional forms.
                    </p>
                </div>
                
                <!-- Admin/Testing: Verification Toggle (remove in production) -->
                <div v-if="showAdminControls" class="admin-controls">
                    <p class="admin-label">Admin Controls (Testing Only)</p>
                    <button 
                        class="btn btn-success verify-button"
                        @click="verifyForm"
                        :disabled="isVerifying"
                    >
                        <span v-if="isVerifying" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ isVerifying ? 'Verifying...' : '✓ Mark as Verified' }}
                    </button>
                    <div class="debug-info">
                        <p>Debug: Check browser console for detailed logs</p>
                        <p>Current Status: {{ verificationState ? 'Pending Verification' : 'Missing' }}</p>
                        <p class="debug-details">
                            <span class="debug-item">Phone: {{ verificationState?.currentUserPhone.value || 'N/A' }}</span>
                            <span class="debug-item">Form Type: {{ submittedFormTypeValue || verificationState?.state?.value?.submittedFormType || 'N/A' }}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch } from 'vue'
import type { FormType } from '../src/types/formTypes'
import './styles/AwaitingVerification.css'

// Inject verification state from App.vue
const verificationState = inject<{
  state: { value: { submittedFormType: FormType | null; verified: boolean } }
  currentUserPhone: { value: string | null }
  updateVerified: (verified: boolean) => void
  hasSubmittedForm: { value: boolean }
}>('verificationState')

const verificationStatus = ref<{ submittedAt: string; verified?: boolean; formType?: FormType } | null>(null)
const submittedFormType = ref<string>('')
const submittedFormTypeValue = ref<FormType | null>(null)

const initializeFormType = () => {
    // Get the submitted form type from injected state (state is a ref, need .value)
    const stateValue = verificationState?.state?.value
    if (stateValue?.submittedFormType) {
        submittedFormTypeValue.value = stateValue.submittedFormType
        submittedFormType.value = stateValue.submittedFormType.charAt(0).toUpperCase() + stateValue.submittedFormType.slice(1)
        verificationStatus.value = {
            submittedAt: new Date().toISOString(), // Use current time as submitted time
            verified: stateValue.verified,
            formType: stateValue.submittedFormType
        }
    }
}

onMounted(() => {
    initializeFormType()
})

// Watch for changes to the state in case it updates after mount
watch(() => verificationState?.state?.value?.submittedFormType, (newFormType) => {
    if (newFormType && !submittedFormTypeValue.value) {
        initializeFormType()
    }
})

// Watch for verification status changes (state is a ref, need .value)
// Note: No reload needed - Vue reactivity will handle showing Dashboard automatically
watch(() => verificationState?.state?.value?.verified, (verified) => {
    if (verified && verificationStatus.value) {
        verificationStatus.value.verified = true
        // Dashboard will appear automatically via computed property in App.vue
    }
})

const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Admin controls for testing (remove in production)
const showAdminControls = ref(true) // Set to false in production
const isVerifying = ref(false)

const verifyForm = async () => {
    // Try to get form type from state if not already set
    if (!submittedFormTypeValue.value && verificationState?.state?.value?.submittedFormType) {
        submittedFormTypeValue.value = verificationState.state.value.submittedFormType
        submittedFormType.value = verificationState.state.value.submittedFormType.charAt(0).toUpperCase() + verificationState.state.value.submittedFormType.slice(1)
    }
    
    if (!verificationState) {
        console.error('Verification state not available')
        alert('Error: Verification state not available')
        return
    }
    
    if (!submittedFormTypeValue.value) {
        console.error('Form type not available. State value:', verificationState?.state?.value)
        alert('Error: Form type not available.')
        return
    }
    
    if (!verificationState.currentUserPhone.value) {
        console.error('User phone number not available')
        alert('Error: User phone number not available')
        return
    }
    
    isVerifying.value = true
    
    try {
        const { updateTestUser } = await import('../src/config/testUsers')
        
        const phoneNumber = verificationState.currentUserPhone.value
        const updates = {
            submittedFormType: submittedFormTypeValue.value,
            verified: true
        }
        
        await updateTestUser(phoneNumber, updates)
        verificationState.updateVerified(true)
        
        // Update local status
        if (verificationStatus.value) {
            verificationStatus.value.verified = true
        }
        
        // State is updated - Vue reactivity will automatically show Dashboard
        isVerifying.value = false
    } catch (error) {
        console.error('Error during verification:', error)
        alert(`Error updating via API: ${error instanceof Error ? error.message : 'Unknown error'}`)
        isVerifying.value = false
    }
}
</script>

