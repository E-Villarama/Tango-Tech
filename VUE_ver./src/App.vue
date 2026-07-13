<template>
  <div id="app">
    <!-- Terms of Service Page -->
    <TermsOfService
      v-if="showTermsOfService"
      @go-back="showTermsOfService = false"
    />

    <!-- Authentication Views (visible when not showing ToS) -->
    <template v-if="!showTermsOfService">
      <Login 
        v-if="!isAuthenticated && !showSignup" 
        :onLogin="handleLogin"
        @switch-to-signup="showSignup = true"
        @switch-to-terms="showTermsOfService = true"
      />
      <Signup
        v-if="!isAuthenticated && showSignup"
        :onSignUp="handleSignUp"
        @switch-to-login="showSignup = false"
        @switch-to-terms="showTermsOfService = true"
      />
      
      <!-- Main App (after authentication) -->
      <template v-if="isAuthenticated">
        <Nav />
        <!-- Show Dashboard if verified, otherwise show Forms (which handles awaiting verification) -->
        <Dashboard 
          v-if="verifiedFormType" 
          :form-type="verifiedFormType"
        />
        <Forms v-else />
      </template>

      <!-- Location Gate Modal - Appears as overlay on top -->
      <LocationGateModal
        :show="showLocationGate"
        :permission-status="locationPermissionStatus"
        :status="locationStatus"
        :error-message="locationErrorMessage"
        @enable-location="handleEnableLocation"
        @retry="handleRetryLocation"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import Nav from '../components/Nav.vue'
import Forms from '../components/Forms.vue'
import Dashboard from '../components/Dashboard.vue'
import Login from '../components/Login.vue'
import Signup from '../components/Signup.vue'
import TermsOfService from '../components/TermsOfService.vue'
import LocationGateModal from '../components/LocationGateModal.vue'
import { validateTestUser, getInitialVerificationState, type TestUser } from './config/testUsers'
import { useGlobalLocation } from './composables/useGlobalLocation'
import type { LoginCredentials, SignUpData } from './types/auth'
import type { FormType } from './types/formTypes'

const isAuthenticated = ref(false)
const showSignup = ref(false)
const showTermsOfService = ref(false)

// Location gate state
const showLocationGate = ref(false)
const locationPermissionStatus = ref<'prompt' | 'granted' | 'denied'>('prompt')
const locationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const locationErrorMessage = ref<string | null>(null)

// Initialize global location composable
const { 
  locationState, 
  initializeLocation, 
  checkPermissionStatus 
} = useGlobalLocation()

// In-memory state for current user (not using localStorage)
const currentUser = ref<TestUser | null>(null)
const userVerificationState = ref<{
  submittedFormType: FormType | null
  verified: boolean
}>({
  submittedFormType: null,
  verified: false
})

// Check if user has a verified form (should see dashboard)
const verifiedFormType = computed(() => {
  if (userVerificationState.value.verified && userVerificationState.value.submittedFormType) {
    return userVerificationState.value.submittedFormType
  }
  return null
})

// Computed for hasSubmittedForm
const hasSubmittedForm = computed(() => {
  return userVerificationState.value.submittedFormType !== null && !userVerificationState.value.verified
})

// Provide verification state to child components
provide('verificationState', {
  state: userVerificationState,
  currentUserPhone: computed(() => currentUser.value?.phoneNumber || null),
  updateSubmitted: (formType: FormType) => {
    userVerificationState.value.submittedFormType = formType
    userVerificationState.value.verified = false
  },
  updateVerified: (verified: boolean) => {
    if (userVerificationState.value.submittedFormType) {
      userVerificationState.value.verified = verified
    }
  },
  hasSubmittedForm
})

/**
 * Handle enable location button click
 * Requests location permission from browser
 */
const handleEnableLocation = async () => {
  try {
    locationStatus.value = 'loading'
    locationErrorMessage.value = null
    
    await initializeLocation()
    
    // Success - close gate modal
    locationStatus.value = 'success'
    locationPermissionStatus.value = 'granted'
    showLocationGate.value = false
  } catch (error) {
    console.error('Location initialization error:', error)
    locationStatus.value = 'error'
    locationErrorMessage.value = error instanceof Error ? error.message : 'Failed to capture location'
    
    // Update permission status from global state
    if (locationState.permissionStatus === 'denied') {
      locationPermissionStatus.value = 'denied'
    }
  }
}

/**
 * Handle retry location after user fixes permissions
 */
const handleRetryLocation = async () => {
  await checkPermissionStatus()
  await handleEnableLocation()
}

/**
 * Check if location is granted
 * Used to prevent login/signup without location permission
 */
const isLocationGranted = computed(() => {
  return locationState.permissionStatus === 'granted' && 
         locationState.status === 'success' &&
         !showLocationGate.value
})

/**
 * Check location permission on app mount
 * Show modal overlay if not granted (with a delay for better UX)
 */
onMounted(async () => {
  try {
    await checkPermissionStatus()
    
    // If permission is already granted, try to get location automatically
    if (locationState.permissionStatus === 'granted') {
      locationStatus.value = 'loading'
      await initializeLocation()
      locationStatus.value = 'success'
      showLocationGate.value = false
    } else {
      // Delay showing the modal to let user see the login page first
      // This creates a smoother, less jarring experience
      setTimeout(() => {
        showLocationGate.value = true
        locationPermissionStatus.value = locationState.permissionStatus
      }, 1500) // 1.5 second delay
    }
  } catch (error) {
    console.error('Error checking location permission on mount:', error)
    // Show gate with error (also with delay)
    setTimeout(() => {
      showLocationGate.value = true
      locationStatus.value = 'error'
      locationErrorMessage.value = 'Failed to check location permission'
    }, 1500)
  }
})

// Login handler - only accepts test user credentials and requires location
const handleLogin = async (credentials: LoginCredentials): Promise<boolean> => {
  // Check if location is granted before allowing login
  if (!isLocationGranted.value) {
    showLocationGate.value = true
    return false
  }
  
  try {
    // Validate against test users via API
    const user = await validateTestUser(credentials.phoneNumber.trim(), credentials.password)
    
    if (!user) {
      return false
    }
    
    // Store current user
    currentUser.value = user
    
    // Initialize user's verification status from test user config (in-memory only)
    const verificationState = getInitialVerificationState(user)
    userVerificationState.value = {
      submittedFormType: verificationState.submittedFormType || null,
      verified: verificationState.verified
    }
    
    isAuthenticated.value = true
    return true
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

// Signup handler - disabled for now, only test users can login
const handleSignUp = async (data: SignUpData): Promise<boolean> => {
  // Check if location is granted before allowing signup
  if (!isLocationGranted.value) {
    showLocationGate.value = true
    return false
  }
  
  // For testing, signup is disabled - users must use test credentials
  // In production, this would create a new user account
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Show message that signup is disabled
  alert('Signup is currently disabled. Please use one of the test user credentials to login.\n\nSee src/data/testUsers.json for available test accounts.')
  
  return false
}
</script>

<style scoped></style>
