<template>
    <div class="borrower-dashboard">
        <div class="dashboard-header mb-4">
            <h1 class="dashboard-title">Borrower Dashboard</h1>
            <p class="dashboard-subtitle">Welcome back! Manage your loan applications and documents.</p>
        </div>

        <div class="dashboard-content">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Borrower Features</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <h6>📄 Loan Applications</h6>
                            <p class="text-muted">View and track your loan applications.</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6>📊 Loan Status</h6>
                            <p class="text-muted">Check the status of your loans.</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6>📁 Document Management</h6>
                            <p class="text-muted">Manage and upload required documents.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Borrower-specific dashboard logic
import '../styles/dashboards/BorrowerDashboard.css'
</script>

