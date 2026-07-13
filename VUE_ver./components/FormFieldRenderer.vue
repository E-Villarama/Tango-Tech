<template>
    <div>
        <label v-if="showLabel" :for="field.id" class="form-label">
            {{ field.label }}
            <span v-if="field.required" class="text-danger">*</span>
        </label>

        <!-- Text Input (text, number, date, time, email, etc.) -->
        <input
            v-if="isInputType"
            :id="field.id"
            :type="field.type"
            class="form-control"
            :class="{ 'is-invalid': showInvalid && isInvalid }"
            :value="modelValue"
            :placeholder="field.placeholder"
            :required="field.required"
            :pattern="field.pattern"
            :minlength="field.minlength"
            :maxlength="field.maxlength"
            :min="field.min"
            :max="field.max"
            :style="inputStyle"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            @blur="$emit('blur')"
        />

        <!-- Textarea -->
        <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.id"
            class="form-control"
            :class="{ 'is-invalid': showInvalid && isInvalid }"
            :value="modelValue as string"
            :placeholder="field.placeholder"
            :required="field.required"
            :rows="field.rowSpan || 4"
            :pattern="field.pattern"
            :minlength="field.minlength"
            :maxlength="field.maxlength"
            @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
            @blur="$emit('blur')"
        ></textarea>

        <!-- Select -->
        <select
            v-else-if="field.type === 'select'"
            :id="field.id"
            class="form-select"
            :class="{ 'is-invalid': showInvalid && isInvalid }"
            :value="modelValue"
            :required="field.required"
            :style="inputStyle"
            @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
            @blur="$emit('blur')"
        >
            <option value="" disabled>{{ field.placeholder || 'Select an option...' }}</option>
            <option
                v-for="option in field.options"
                :key="option.value"
                :value="option.value"
            >
                {{ option.label }}
            </option>
        </select>

        <!-- Checkbox -->
        <div v-else-if="field.type === 'checkbox'" class="form-check">
            <input
                :id="field.id"
                type="checkbox"
                class="form-check-input"
                :class="{ 'is-invalid': showInvalid && isInvalid }"
                :checked="modelValue as boolean"
                :required="field.required"
                @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
                @blur="$emit('blur')"
            />
            <label v-if="!showLabel" class="form-check-label" :for="field.id">
                {{ field.label }}
            </label>
        </div>

        <!-- Validation Error Message -->
        <div v-if="showInvalid && isInvalid" class="invalid-feedback d-block">
            <!-- Custom error has priority (e.g., "Email already exists") -->
            <span v-if="field.customError">
                {{ field.customError }}
            </span>
            <span v-else-if="field.required && (!modelValue || modelValue === '')">
                *Required
            </span>
            <span v-else-if="field.type === 'email' && modelValue">
                Please input a valid {{ field.label }} (example@domain.com)
            </span>
            <span v-else-if="field.type === 'tel' && modelValue">
                Please input a valid {{ field.label }} {{ getValidationRuleDescription }}
            </span>
            <span v-else-if="field.minlength && String(modelValue).length < field.minlength">
                {{ field.label }} must be at least {{ field.minlength }} characters.
            </span>
            <span v-else-if="field.maxlength && String(modelValue).length > field.maxlength">
                {{ field.label }} must be no more than {{ field.maxlength }} characters.
            </span>
            <span v-else-if="field.type === 'number' && field.min !== undefined && Number(modelValue) < field.min">
                {{ field.label }} must be at least {{ field.min }}.
            </span>
            <span v-else-if="field.type === 'number' && field.max !== undefined && Number(modelValue) > field.max">
                {{ field.label }} must be no more than {{ field.max }}.
            </span>
            <span v-else-if="field.pattern && modelValue">
                Please input a valid {{ field.label }} {{ getValidationRuleDescription }}
            </span>
            <span v-else>
                Please input a valid {{ field.label }}.
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * FormFieldRenderer Component
 *
 * This is the main component that renders all the different types of form fields.
 * It handles text inputs, textareas, selects, checkboxes, and validates them.
 *
 * IMPORTANT: Per-Field Touched State
 * - The `touched` prop should be a BOOLEAN for the specific field (not global)
 * - Parent component should track touched state per field using a Set:
 *   Example: const touchedFields = ref(new Set<string>())
 *   Usage: :touched="touchedFields.has(field.key)" @blur="touchedFields.add(field.key)"
 * - This ensures only fields the user has interacted with show validation errors
 *
 * The component automatically shows validation errors when a field is touched and invalid.
 * It also supports regex pattern validation (like for emails or phone numbers).
 *
 * To add a new field type, you'll need to:
 * 1. Add a new v-else-if condition in the template
 * 2. Add validation logic in the isInvalid computed property
 * 3. Make sure the field type is handled in useFormInitialization
 */
import { computed } from 'vue'

interface Props {
    field: {
        id: string
        key: string
        label: string
        type: string
        placeholder?: string
        required?: boolean
        pattern?: string
        minlength?: number
        maxlength?: number
        min?: number
        max?: number
        customError?: string
        options?: Array<{ value: string; label: string }>
        rowSpan?: number
    }
    modelValue: string | number | boolean
    touched?: boolean
    showLabel?: boolean
    inputStyle?: string | Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
    touched: false,
    showLabel: true,
    inputStyle: undefined
})

defineEmits<{
    'update:modelValue': [value: string | number | boolean]
    blur: []
}>()

/**
 * Checks if the field type should render as a regular input element
 *
 * These are all the HTML input types that use the <input> tag. Everything else
 * (textarea, select, checkbox) has its own template section.
 */
const isInputType = computed(() => {
    const inputTypes = ['text', 'number', 'date', 'time', 'email', 'tel', 'url', 'password']
    return inputTypes.includes(props.field.type)
})

/**
 * Validates if the field is invalid
 *
 * This checks:
 * 1. If field is required and empty
 * 2. Email format validation (for type='email')
 * 3. Phone number format validation (for type='tel')
 * 4. If field has a pattern and value doesn't match
 * 5. Minlength/maxlength validation
 * 6. Number min/max range validation
 * 7. For checkboxes, if required and unchecked
 *
 * Optional fields that are empty are always valid.
 *
 * To modify validation rules, edit the conditions below.
 */
const isInvalid = computed(() => {
    // Custom error always shows as invalid
    if (props.field.customError) return true
    
    // Optional empty fields are always valid - no need to validate them
    if (!props.field.required && !props.modelValue) return false

    // Checkboxes are invalid if required and unchecked
    if (props.field.type === 'checkbox') {
        return !props.modelValue
    }

    // Check if required field is empty
    if (props.field.required && (!props.modelValue || props.modelValue === '')) {
        return true
    }

    // If field has a value, validate it
    if (props.modelValue && props.modelValue !== '') {
        const stringValue = String(props.modelValue)
        const numValue = typeof props.modelValue === 'number' ? props.modelValue : Number(props.modelValue)

        // Email format validation (if type is email and no pattern is provided)
        if (props.field.type === 'email' && !props.field.pattern) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(stringValue)) {
                return true
            }
        }

        // Phone number format validation (if type is tel and no pattern is provided)
        if (props.field.type === 'tel' && !props.field.pattern) {
            // Common phone formats: +1234567890, (123) 456-7890, 123-456-7890, 123.456.7890, etc.
            // Remove spaces for validation, then check format
            const phoneWithoutSpaces = stringValue.replace(/\s/g, '')
            const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/
            if (!phoneRegex.test(phoneWithoutSpaces)) {
                return true
            }
        }

        // Minlength validation
        if (props.field.minlength && stringValue.length < props.field.minlength) {
            return true
        }

        // Maxlength validation
        if (props.field.maxlength && stringValue.length > props.field.maxlength) {
            return true
        }

        // Number range validation (for number fields)
        if (props.field.type === 'number' && !isNaN(numValue)) {
            if (props.field.min !== undefined && numValue < props.field.min) {
                return true
            }
            if (props.field.max !== undefined && numValue > props.field.max) {
                return true
            }
        }

        // Check pattern validation if field has a value and pattern is defined
        // This is where regex patterns (like custom email validation) get checked
        if (props.field.pattern) {
            try {
                const regex = new RegExp(props.field.pattern)
                if (!regex.test(stringValue)) {
                    return true // Pattern doesn't match
                }
            } catch (error) {
                // If someone passes a bad regex pattern, don't break the form
                console.warn('Invalid regex pattern:', props.field.pattern, error)
            }
        }
    }

    return false
})

/**
 * Get validation rule description based on pattern
 * Returns human-readable description of what format is expected
 */
const getValidationRuleDescription = computed(() => {
    if (!props.field.pattern) return ''
    
    const pattern = props.field.pattern
    
    // Philippine mobile number
    if (props.field.type === 'tel' && pattern.includes('9\\d{9}')) {
        return '(10 digits starting with 9)'
    }
    
    // Alphanumeric
    if (pattern.includes('[a-zA-Z0-9]') || pattern.includes('\\w')) {
        return '(letters and numbers only)'
    }
    
    // Numbers only
    if (pattern === '^[0-9]+$' || (pattern.includes('\\d') && !pattern.includes('[a-zA-Z]'))) {
        return '(numbers 0-9 only)'
    }
    
    // Letters only
    if (pattern === '^[a-zA-Z]+$' || pattern.includes('[a-zA-Z]')) {
        return '(letters only)'
    }
    
    return ''
})

/**
 * Whether to show the invalid state styling and error message
 *
 * Only shows errors after the field has been touched (user interacted with it).
 * This prevents showing errors before the user has even tried to fill the field.
 */
const showInvalid = computed(() => {
    return props.touched && isInvalid.value
})
</script>

