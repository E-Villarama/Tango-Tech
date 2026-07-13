<template>
    <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <span class="icon">📍</span>
                        Location Access Required
                    </h5>
                    <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-warning mb-3">
                        <strong>Location is not valid.</strong> Turn on Location access and retry.
                    </div>

                    <p class="mb-3">
                        We need your location to verify site visits and ensure accurate monitoring reports.
                    </p>

                    <!-- Permission Status -->
                    <div v-if="permissionStatus === 'denied'" class="alert alert-danger mb-3">
                        <strong>Permission Denied</strong>
                        <p class="mb-0 mt-2">You've blocked location access. Follow the steps below to enable it:</p>
                    </div>

                    <!-- Browser-specific instructions -->
                    <div class="instructions-card">
                        <h6 class="instructions-title">How to Enable Location Access:</h6>
                        
                        <!-- Chrome/Edge instructions -->
                        <div v-if="isChromeBased" class="instruction-step">
                            <strong>For Chrome/Edge:</strong>
                            <ol>
                                <li>Click the lock icon (🔒) or info icon (ⓘ) in the address bar</li>
                                <li>Find "Location" in the permissions list</li>
                                <li>Change it to "Allow"</li>
                                <li>Click "Retry Location" below</li>
                            </ol>
                        </div>

                        <!-- Firefox instructions -->
                        <div v-else-if="isFirefox" class="instruction-step">
                            <strong>For Firefox:</strong>
                            <ol>
                                <li>Click the lock icon (🔒) in the address bar</li>
                                <li>Click "Clear This Permission" next to Location</li>
                                <li>Click "Retry Location" below to request permission again</li>
                            </ol>
                        </div>

                        <!-- Safari instructions -->
                        <div v-else-if="isSafari" class="instruction-step">
                            <strong>For Safari:</strong>
                            <ol>
                                <li>Go to Safari menu → Settings → Websites → Location</li>
                                <li>Find this website and change to "Allow"</li>
                                <li>Refresh the page and try again</li>
                            </ol>
                        </div>

                        <!-- Generic instructions -->
                        <div v-else class="instruction-step">
                            <strong>General Steps:</strong>
                            <ol>
                                <li>Click the lock or info icon in your browser's address bar</li>
                                <li>Look for Location or Site Permissions</li>
                                <li>Change Location permission to "Allow"</li>
                                <li>Click "Retry Location" below</li>
                            </ol>
                        </div>
                    </div>

                    <!-- Contact admin fallback -->
                    <div class="alert alert-info mt-3 mb-0">
                        <small>
                            <strong>Still having issues?</strong><br>
                            If failure persists, please contact admin for assistance.
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="$emit('close')">
                        Close
                    </button>
                    <button 
                        type="button" 
                        class="btn btn-primary" 
                        @click="$emit('retry')"
                        :disabled="isRetrying"
                    >
                        <span v-if="isRetrying" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ isRetrying ? 'Retrying...' : 'Retry Location' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    show: boolean
    permissionStatus?: 'prompt' | 'granted' | 'denied'
    isRetrying?: boolean
}

withDefaults(defineProps<Props>(), {
    permissionStatus: 'denied',
    isRetrying: false
})

defineEmits<{
    close: []
    retry: []
}>()

// Detect browser type for specific instructions
const userAgent = navigator.userAgent.toLowerCase()

const isChromeBased = computed(() => {
    return userAgent.includes('chrome') || userAgent.includes('edge') || userAgent.includes('chromium')
})

const isFirefox = computed(() => {
    return userAgent.includes('firefox')
})

const isSafari = computed(() => {
    return userAgent.includes('safari') && !userAgent.includes('chrome')
})
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    padding: 1rem;
}

.modal-dialog {
    max-width: 500px;
    width: 100%;
}

.modal-content {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #dee2e6;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.modal-title .icon {
    font-size: 1.5rem;
}

.btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.5;
}

.btn-close:hover {
    opacity: 1;
}

.modal-body {
    padding: 1.5rem;
}

.instructions-card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
}

.instructions-title {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #212529;
}

.instruction-step {
    margin-bottom: 0;
}

.instruction-step strong {
    color: #0d6efd;
    display: block;
    margin-bottom: 0.5rem;
}

.instruction-step ol {
    margin-bottom: 0;
    padding-left: 1.5rem;
}

.instruction-step li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
}

.modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
}

/* Mobile adjustments */
@media (max-width: 576px) {
    .modal-dialog {
        max-width: 100%;
        margin: 0;
    }

    .modal-content {
        border-radius: 0;
    }

    .modal-footer {
        flex-direction: column;
    }

    .modal-footer .btn {
        width: 100%;
    }
}
</style>
