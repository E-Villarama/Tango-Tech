<template>
    <div v-if="isVisible" class="alert alert-success mb-4 verification-banner" role="alert">
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <h4 class="alert-heading mb-2">
                    <span class="me-2">✓</span>
                    Verification Complete!
                </h4>
                <p class="mb-0">Your {{ formTypeDisplay }} onboarding has been verified. Welcome to your dashboard!</p>
            </div>
            <button
                type="button"
                class="btn-close ms-3"
                aria-label="Close"
                @click="closeBanner"
            ></button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { FormType } from '../src/types/formTypes'
import './styles/VerificationBanner.css'

interface Props {
    formType: FormType
    autoCloseDelay?: number // milliseconds, 0 to disable auto-close
}

const props = withDefaults(defineProps<Props>(), {
    autoCloseDelay: 30000 // 30 seconds default
})

const isVisible = ref(true)
let autoCloseTimer: ReturnType<typeof setTimeout> | null = null

// Storage key for persisting closed state
const getStorageKey = () => `verificationBannerClosed_${props.formType}`

// Check if banner was previously closed
const wasClosed = () => {
    if (typeof localStorage === 'undefined') return false
    return localStorage.getItem(getStorageKey()) === 'true'
}

// Mark banner as closed in localStorage
const markAsClosed = () => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(getStorageKey(), 'true')
    }
}

// Form type display name
const formTypeDisplay = computed(() => {
    const displayNames: Record<FormType, string> = {
        agent: 'agent',
        borrower: 'borrower',
        lender: 'lender',
        supervisor: 'supervisor',
        partner: 'partner',
        admin: 'admin'
    }
    return displayNames[props.formType] || props.formType
})

const closeBanner = () => {
    isVisible.value = false
    markAsClosed()
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
        autoCloseTimer = null
    }
}

// Setup auto-close timer
const setupAutoClose = () => {
    if (props.autoCloseDelay > 0) {
        autoCloseTimer = setTimeout(() => {
            closeBanner()
        }, props.autoCloseDelay)
    }
}

// Initialize visibility based on localStorage
onMounted(() => {
    if (wasClosed()) {
        isVisible.value = false
    } else {
        setupAutoClose()
    }
})

// Cleanup timer on unmount
onUnmounted(() => {
    if (autoCloseTimer) {
        clearTimeout(autoCloseTimer)
    }
})

// Watch for formType changes and reset visibility
watch(() => props.formType, () => {
    if (!wasClosed()) {
        isVisible.value = true
        setupAutoClose()
    } else {
        isVisible.value = false
    }
})
</script>

