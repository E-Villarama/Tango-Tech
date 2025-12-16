<template>
    <div class="lender-dashboard">
        <div class="dashboard-header mb-4">
            <h1 class="dashboard-title">Lender Dashboard</h1>
            <p class="dashboard-subtitle">Welcome back! Review applications and manage borrowers.</p>
        </div>

        <div class="dashboard-content">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Lender Features</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <h6>📋 Loan Applications</h6>
                            <p class="text-muted">Review and process loan applications.</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6>👥 Borrower Management</h6>
                            <p class="text-muted">Manage borrower information and relationships.</p>
                        </div>
                        <div class="col-md-6 mb-3">
                            <h6>📊 Financial Reports</h6>
                            <p class="text-muted">View financial reports and analytics.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
// Lender-specific dashboard logic
import '../styles/dashboards/LenderDashboard.css'
</script>

