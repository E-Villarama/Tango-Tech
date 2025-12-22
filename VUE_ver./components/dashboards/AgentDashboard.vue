<template>
    <div class="agent-dashboard">
        <!-- Agent-specific dashboard content -->
        <div class="dashboard-header mb-4">
            <h1 class="dashboard-title">Agent Dashboard</h1>
            <p class="dashboard-subtitle">Welcome back! Manage your listings and clients.</p>
        </div>

        <!-- Dashboard Content Sections -->
        <div class="dashboard-content">
            <!-- Quick Actions -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">Quick Actions</h5>
                </div>
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <button class="btn btn-primary w-100" @click="$emit('open-monitoring-form')">
                                Submit Monitoring Form
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary w-100">
                                Manage Listings
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary w-100">
                                View Clients
                            </button>
                        </div>
                        <div class="col-md-4">
                            <button class="btn btn-primary w-100">
                                Track Transactions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import '../styles/dashboards/AgentDashboard.css'

defineEmits<{
    'open-monitoring-form': []
}>()
</script>

