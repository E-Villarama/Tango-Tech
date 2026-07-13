<template>
    <div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
        <div class="card" style="width: 100%; max-width: 400px;">
            <div class="card-body p-4">
                <h2 class="card-title text-center mb-4">Let's Tango!</h2>
                
                <form @submit.prevent="handleLogin">
                    <AuthFieldRenderer
                        v-for="field in formFields" 
                        :key="field.id"
                        :field="field"
                        v-model="formData[field.key]"
                        :touched="touchedFields.has(field.key)"
                        :bypass-validation="isTestUserPhone(formData.phoneNumber)"
                        @blur="touchedFields.add(field.key)"
                    />
                    
                    <div v-if="errorMessage" class="alert alert-danger" role="alert">
                        {{ errorMessage }}
                    </div>
                    <button type="submit" class="btn btn-primary w-100 mb-3" :disabled="isLoading">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {{ isLoading ? 'Logging in...' : 'Login' }}
                    </button>
                    <div class="text-center">
                        <p class="mb-0">Don't have an account? 
                            <a href="#" @click.prevent="$emit('switchToSignup')" class="text-decoration-none">Create one</a>
                        </p>
                        <small class="text-muted d-block mt-2">
                            <strong>Test Users:</strong> See TEST_USERS.md for credentials
                        </small>
                        <small class="text-muted d-block mt-2">
                            <a href="#" @click.prevent="$emit('switchToTerms')" class="text-muted text-decoration-none">Terms of Service</a>
                        </small>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { LoginCredentials } from '../src/types/auth'
import AuthFieldRenderer from './AuthFieldRenderer.vue'
import './styles/Login.css'

interface FormField {
    id: string
    key: keyof LoginCredentials
    label: string
    type: string
    placeholder: string
    required?: boolean
    minlength?: number
}

interface Props {
    onLogin: (credentials: LoginCredentials) => Promise<boolean> | boolean
}

const props = defineProps<Props>()
defineEmits<{
    switchToSignup: []
    switchToTerms: []
}>()

const formFields: FormField[] = [
    {
        id: 'phoneNumber',
        key: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter mobile number (e.g., 9171234567)',
        required: true
    },
    {
        id: 'password',
        key: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password',
        required: true,
        minlength: 6
    }
]

const formData = reactive<LoginCredentials>({
    phoneNumber: '',
    password: ''
})

const errorMessage = ref('')
const isLoading = ref(false)
const touchedFields = ref(new Set<string>())

/**
 * Check if this is a test user phone number
 * Test users can use simple values like "1", "2", "123", "admin" for easier testing
 */
const isTestUserPhone = (phone: string): boolean => {
    const testPhones = ['1', '2', '123', 'admin']
    return testPhones.includes(phone.trim())
}

/**
 * Validates Philippine mobile number format
 */
const validatePhilippineMobile = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '')
    const mobileRegex = /^9\d{9}$/
    return mobileRegex.test(cleaned)
}

/**
 * Validates form before submission
 */
const validateForm = (): boolean => {
    // Check if required fields are filled
    if (!formData.phoneNumber.trim() || !formData.password) {
        errorMessage.value = 'Please fill in all required fields'
        return false
    }

    // Skip phone validation for test users
    if (!isTestUserPhone(formData.phoneNumber)) {
        // Validate phone number format for real users
        if (!validatePhilippineMobile(formData.phoneNumber)) {
            errorMessage.value = 'Please enter a valid Philippine mobile number (10 digits starting with 9)'
            return false
        }
    }

    // Skip password length validation for test users (they use "123")
    if (!isTestUserPhone(formData.phoneNumber)) {
        // Validate password length for real users
        if (formData.password.length < 6) {
            errorMessage.value = 'Password must be at least 6 characters'
            return false
        }
    }

    return true
}

const handleLogin = async () => {
    errorMessage.value = ''
    
    // Validate form before submitting
    if (!validateForm()) {
        console.log('❌ Form validation failed')
        return
    }
    
    isLoading.value = true
    
    try {
        const credentials: LoginCredentials = {
            phoneNumber: formData.phoneNumber.trim(),
            password: formData.password
        }
        
        console.log('🔐 Attempting login with:', { phoneNumber: credentials.phoneNumber, isTestUser: isTestUserPhone(credentials.phoneNumber) })
        
        // Call the parent's login handler (can be replaced with API call)
        const success = await props.onLogin(credentials)
        
        if (!success) {
            console.log('❌ Login failed - invalid credentials')
            errorMessage.value = 'Invalid phone number or password'
            isLoading.value = false
        } else {
            console.log('✅ Login successful')
        }
        // If successful, the parent component will handle the state change
    } catch (error) {
        console.error('❌ Login error:', error)
        errorMessage.value = 'An error occurred. Please try again.'
        isLoading.value = false
    }
}
</script>

