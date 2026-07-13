<template>
    <div v-if="show" class="location-gate-backdrop">
        <div class="location-gate-dialog">
            <div class="location-gate-content">
                <div class="location-gate-header">
                    <span class="location-icon">📍</span>
                    <h2 class="location-gate-title">Location Services Required</h2>
                </div>
                
                <div class="location-gate-body">
                    <!-- Initial prompt state -->
                    <div v-if="currentState === 'initial'" class="message-section">
                        <p class="message-text">
                            This application requires access to your location to verify site visits and ensure accurate monitoring reports.
                        </p>
                        <p class="message-text">
                            By using this app, you agree to our Terms of Service which include location data collection.
                        </p>
                        <div class="alert alert-info mt-3">
                            <strong>Privacy Notice:</strong> Your location is only captured when required for monitoring forms and is used solely for verification purposes.
                        </div>
                    </div>

                    <!-- Loading state -->
                    <div v-if="currentState === 'loading'" class="message-section">
                        <div class="spinner-container">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-3">Requesting location access...</p>
                        </div>
                    </div>

                    <!-- Error/Denied state -->
                    <div v-if="currentState === 'denied'" class="message-section">
                        <div class="alert alert-danger">
                            <strong>Location Access Denied</strong>
                            <p class="mb-0 mt-2">You must enable location services to use this application.</p>
                        </div>

                        <div class="instructions-card">
                            <h6 class="instructions-title">How to Enable Location Access:</h6>
                            
                            <!-- Chrome/Edge instructions -->
                            <div v-if="isChromeBased" class="instruction-step">
                                <strong>For Chrome/Edge:</strong>
                                <ol>
                                    <li>Click the lock icon (🔒) or info icon (ⓘ) in the address bar</li>
                                    <li>Find "Location" in the permissions list</li>
                                    <li>Change it to "Allow"</li>
                                    <li>Click "Retry" below</li>
                                </ol>
                            </div>

                            <!-- Firefox instructions -->
                            <div v-else-if="isFirefox" class="instruction-step">
                                <strong>For Firefox:</strong>
                                <ol>
                                    <li>Click the lock icon (🔒) in the address bar</li>
                                    <li>Click "Clear This Permission" next to Location</li>
                                    <li>Click "Retry" below to request permission again</li>
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
                                    <li>Click "Retry" below</li>
                                </ol>
                            </div>
                        </div>

                        <div class="alert alert-warning mt-3">
                            <small>
                                <strong>Note:</strong> If you're on a mobile device, ensure location services are enabled in your device settings.
                            </small>
                        </div>
                    </div>

                    <!-- Error state (not permission denial) -->
                    <div v-if="currentState === 'error' && errorMessage" class="message-section">
                        <div class="alert alert-danger">
                            <strong>Error</strong>
                            <p class="mb-0 mt-2">{{ errorMessage }}</p>
                        </div>
                        <p class="text-muted">Please ensure your device's location services are enabled and try again.</p>
                    </div>
                </div>
                
                <div class="location-gate-footer">
                    <!-- Initial state button -->
                    <button 
                        v-if="currentState === 'initial'"
                        type="button" 
                        class="btn btn-primary btn-lg w-100"
                        @click="handleEnableLocation"
                    >
                        Enable Location Services
                    </button>

                    <!-- Loading state button (disabled) -->
                    <button 
                        v-if="currentState === 'loading'"
                        type="button" 
                        class="btn btn-primary btn-lg w-100"
                        disabled
                    >
                        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Requesting...
                    </button>

                    <!-- Error/Denied state button -->
                    <button 
                        v-if="currentState === 'denied' || currentState === 'error'"
                        type="button" 
                        class="btn btn-primary btn-lg w-100"
                        @click="handleRetry"
                    >
                        Retry Location Access
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
    show: boolean
    permissionStatus?: 'prompt' | 'granted' | 'denied'
    status?: 'idle' | 'loading' | 'success' | 'error'
    errorMessage?: string | null
}

interface Emits {
    (e: 'enable-location'): void
    (e: 'retry'): void
}

const props = withDefaults(defineProps<Props>(), {
    permissionStatus: 'prompt',
    status: 'idle',
    errorMessage: null
})

const emit = defineEmits<Emits>()

// Determine current state for UI
const currentState = computed(() => {
    if (props.status === 'loading') return 'loading'
    if (props.permissionStatus === 'denied') return 'denied'
    if (props.status === 'error') return 'error'
    return 'initial'
})

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

const handleEnableLocation = () => {
    emit('enable-location')
}

const handleRetry = () => {
    emit('retry')
}
</script>

<style scoped>
.location-gate-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
    animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.location-gate-dialog {
    max-width: 600px;
    width: 100%;
    animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-30px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

.location-gate-content {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.location-gate-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}

.location-icon {
    font-size: 3rem;
    display: block;
    margin-bottom: 0.5rem;
}

.location-gate-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0;
}

.location-gate-body {
    padding: 2rem;
    max-height: 60vh;
    overflow-y: auto;
}

.message-section {
    text-align: center;
}

.message-text {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #333;
    margin-bottom: 1rem;
}

.spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem 0;
}

.instructions-card {
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    padding: 1.5rem;
    text-align: left;
    margin-top: 1.5rem;
}

.instructions-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #212529;
}

.instruction-step {
    margin-bottom: 0;
}

.instruction-step strong {
    color: #0d6efd;
    display: block;
    margin-bottom: 0.75rem;
    font-size: 1rem;
}

.instruction-step ol {
    margin-bottom: 0;
    padding-left: 1.5rem;
}

.instruction-step li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

.location-gate-footer {
    padding: 1.5rem 2rem 2rem;
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
}

/* Mobile adjustments */
@media (max-width: 576px) {
    .location-gate-backdrop {
        padding: 0;
    }

    .location-gate-dialog {
        max-width: 100%;
        height: 100%;
    }

    .location-gate-content {
        border-radius: 0;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .location-gate-body {
        flex: 1;
        max-height: none;
    }

    .location-gate-header {
        padding: 1.5rem;
    }

    .location-icon {
        font-size: 2.5rem;
    }

    .location-gate-title {
        font-size: 1.5rem;
    }
}

/* Alert overrides for this component */
.alert {
    border-radius: 0.5rem;
    margin-bottom: 0;
}

.alert-info {
    background-color: #e7f3ff;
    border-color: #b3d9ff;
    color: #004085;
}

.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c2c7;
    color: #842029;
}

.alert-warning {
    background-color: #fff3cd;
    border-color: #ffe69c;
    color: #856404;
}
</style>
