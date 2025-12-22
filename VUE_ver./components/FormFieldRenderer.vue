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
            :value="modelValue"
            :placeholder="field.placeholder"
            :required="field.required"
            :rows="field.rowSpan || 4"
            :pattern="field.pattern"
            :minlength="field.minlength"
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
                :checked="modelValue"
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
            <span v-if="field.required && (!modelValue || modelValue === '')">
                Please fill in {{ field.label }}.
            </span>
            <span v-else-if="field.pattern && modelValue">
                {{ field.label }} format is invalid. Please check the format and try again.
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
 * 2. If field has a pattern and value doesn't match
 * 3. For checkboxes, if required and unchecked
 * 
 * Optional fields that are empty are always valid.
 * 
 * To modify validation rules, edit the conditions below.
 */
const isInvalid = computed(() => {
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
    
    // Check pattern validation if field has a value and pattern is defined
    // This is where regex patterns (like email validation) get checked
    if (props.modelValue && props.field.pattern) {
        const stringValue = String(props.modelValue)
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
    
    return false
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

