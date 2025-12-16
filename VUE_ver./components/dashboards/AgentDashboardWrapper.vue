<template>
    <!-- Monitoring Form Page (full page, no container nesting) -->
    <MonitoringForm
        v-if="showMonitoringForm"
        :assigned-borrowers="assignedBorrowers"
        :agent-id="agentId"
        @submit="handleMonitoringFormSubmit"
        @go-back="goBackToDashboard"
    />
    
    <!-- Dashboard Page (with container) -->
    <div v-else class="dashboard-wrapper">
        <div class="container mt-4">
            <!-- Shared Verification Success Banner -->
            <!-- For testing: Add :force-show="true" to always show the banner -->
            <!-- To reset banner state: Open browser console and run: localStorage.removeItem('verificationBannerClosed_agent') -->
            <VerificationBanner form-type="agent" :force-show="true" />
            
            <AgentDashboard @open-monitoring-form="openMonitoringForm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue'
import AgentDashboard from './AgentDashboard.vue'
import MonitoringForm from '../monitoring/MonitoringForm.vue'
import VerificationBanner from '../VerificationBanner.vue'
import type { MonitoringSubmission } from '../../src/types/monitoring'
import '../styles/dashboards/AgentDashboardWrapper.css'

// Inject verification state to get current user info
const verificationState = inject<{
  currentUserPhone: { value: string | null }
}>('verificationState', {
  currentUserPhone: { value: null }
})

// Agent ID - using phone number as ID for now
const agentId = computed(() => verificationState?.currentUserPhone.value || '')

// Show monitoring form page
const showMonitoringForm = ref(false)

// Mock assigned borrowers - TODO: Replace with actual API call
const assignedBorrowers = ref([
    { id: 'borrower-1', name: 'John Smith' },
    { id: 'borrower-2', name: 'Jane Doe' },
    { id: 'borrower-3', name: 'Bob Johnson' }
])

const openMonitoringForm = () => {
    showMonitoringForm.value = true
}

const goBackToDashboard = () => {
    showMonitoringForm.value = false
}

        const handleMonitoringFormSubmit = async (submission: MonitoringSubmission) => {
            // TODO: Replace with actual API call when backend is ready
            
            // For now, just simulate success
    alert(`Monitoring form submitted successfully for ${submission.borrowerName}!\n\nLocation: ${submission.location.latitude}, ${submission.location.longitude}\nTime: ${submission.submittedAt.toLocaleString()}`)
    
    // Return to dashboard after submission
    goBackToDashboard()
}
</script>

