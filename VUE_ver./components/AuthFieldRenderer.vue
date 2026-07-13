<template>
    <div class="mb-3">
        <label :for="field.id" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
        </label>

        <!-- Password field with show/hide toggle -->
        <div v-if="field.type === 'password'" class="position-relative">
            <input
                :id="field.id"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': showInvalid && isInvalid }"
                :value="modelValue"
                :placeholder="field.placeholder"
                :required="field.required"
                :minlength="bypassValidation ? undefined : field.minlength"
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                @blur="handleBlur"
            />
            <button
                type="button"
                class="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2"
                style="border: none; background: transparent; padding: 0.25rem 0.5rem;"
                @click="showPassword = !showPassword"
                tabindex="-1"
            >
                <span v-if="showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
            </button>
        </div>

        <!-- Regular input fields (text, email, tel) -->
        <input
            v-else
            :id="field.id"
            :type="field.type"
            class="form-control"
            :class="{ 'is-invalid': showInvalid && isInvalid }"
            :value="modelValue"
            :placeholder="field.placeholder"
            :required="field.required"
            :minlength="bypassValidation ? undefined : field.minlength"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            @blur="handleBlur"
        />

        <!-- Validation Error Message -->
        <div v-if="showInvalid && isInvalid" class="invalid-feedback d-block">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FormField {
    id: string
    key: string
    label: string
    type: string
    placeholder: string
    required?: boolean
    minlength?: number
}

interface Props {
    field: FormField
    modelValue: string
    touched?: boolean
    bypassValidation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    touched: false,
    bypassValidation: false
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': []
}>()

const showPassword = ref(false)

const handleBlur = () => {
    emit('blur')
}

/**
 * Validates Philippine mobile number format
 * Must be exactly 10 digits starting with 9 (after removing formatting)
 */
const validatePhilippineMobile = (phone: string): boolean => {
    // Remove all non-digit characters (spaces, dashes, parentheses)
    const cleaned = phone.replace(/\D/g, '')
    
    // Mobile only: exactly 10 digits starting with 9
    const mobileRegex = /^9\d{9}$/
    
    return mobileRegex.test(cleaned)
}

/**
 * Validates email format
 */
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validates password requirements
 */
const validatePassword = (password: string): boolean => {
    return password.length >= 6
}

/**
 * Validates if the field is invalid
 */
const isInvalid = computed(() => {
    // Bypass validation if explicitly disabled (e.g., for test users)
    if (props.bypassValidation) return false
    
    const value = props.modelValue

    // Optional empty fields are valid
    if (!props.field.required && !value) return false

    // Check if required field is empty
    if (props.field.required && (!value || value === '')) {
        return true
    }

    // Field-specific validation if field has a value
    if (value && value !== '') {
        // Phone number validation (Philippine mobile)
        if (props.field.type === 'tel') {
            return !validatePhilippineMobile(value)
        }

        // Email validation
        if (props.field.type === 'email') {
            return !validateEmail(value)
        }

        // Password validation
        if (props.field.type === 'password') {
            return !validatePassword(value)
        }

        // Minlength validation
        if (props.field.minlength && value.length < props.field.minlength) {
            return true
        }
    }

    return false
})

/**
 * Generate appropriate error message based on field type and validation
 */
const errorMessage = computed(() => {
    const value = props.modelValue

    // Required field empty
    if (props.field.required && (!value || value === '')) {
        return '*Required'
    }

    if (value && value !== '') {
        // Phone number specific error
        if (props.field.type === 'tel') {
            return `Please input a valid ${props.field.label} (10 digits starting with 9)`
        }

        // Email specific error
        if (props.field.type === 'email') {
            return `Please input a valid ${props.field.label} (example@domain.com)`
        }

        // Password specific error
        if (props.field.type === 'password') {
            if (props.field.minlength && value.length < props.field.minlength) {
                return `${props.field.label} must be at least ${props.field.minlength} characters.`
            }
            return `${props.field.label} must be at least 6 characters.`
        }

        // Minlength error for other fields
        if (props.field.minlength && value.length < props.field.minlength) {
            return `${props.field.label} must be at least ${props.field.minlength} characters.`
        }
    }

    return `Please input a valid ${props.field.label}.`
})

/**
 * Whether to show the invalid state styling and error message
 * Only shows errors after the field has been touched
 */
const showInvalid = computed(() => {
    return props.touched && isInvalid.value
})
</script>

<style scoped>
.position-relative {
    position: relative;
}
</style>
