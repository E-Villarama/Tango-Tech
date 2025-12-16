<template>
    <!-- Agent Dashboard with Monitoring Form Navigation (separate page) -->
    <AgentDashboardWrapper v-if="formType === 'agent'" />
    
    <!-- Other Dashboards (with container) -->
    <div v-else class="dashboard-wrapper">
        <div class="container mt-4">
            <!-- Shared Verification Success Banner -->
            <!-- For testing: Add :force-show="true" to always show the banner -->
            <!-- To reset banner state: Open browser console and run: localStorage.removeItem('verificationBannerClosed_agent') -->
            <VerificationBanner :form-type="formType" :auto-close-delay="5000"/>

            <BorrowerDashboard v-if="formType === 'borrower'" />
            <!-- Temporarily disabled - focusing on Agent and Borrower only -->
            <!-- <LenderDashboard v-else-if="formType === 'lender'" /> -->
            <!-- <SupervisorDashboard v-else-if="formType === 'supervisor'" /> -->
            <!-- <PartnerDashboard v-else-if="formType === 'partner'" /> -->
            <!-- <AdminDashboard v-else-if="formType === 'admin'" /> -->
            <div v-else class="alert alert-warning">
                <h4>Dashboard Not Available</h4>
                <p>Dashboard type "{{ formType }}" is currently disabled. Only Agent and Borrower dashboards are available.</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FormType } from '../src/types/formTypes'
import './styles/Dashboard.css'
import AgentDashboardWrapper from './dashboards/AgentDashboardWrapper.vue'
import BorrowerDashboard from './dashboards/BorrowerDashboard.vue'
import VerificationBanner from './VerificationBanner.vue'
// Temporarily disabled - focusing on Agent and Borrower only
// import LenderDashboard from './dashboards/LenderDashboard.vue'
// import SupervisorDashboard from './dashboards/SupervisorDashboard.vue'
// import PartnerDashboard from './dashboards/PartnerDashboard.vue'
// import AdminDashboard from './dashboards/AdminDashboard.vue'

interface Props {
    formType: FormType
}

const props = defineProps<Props>()
</script>

