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
        <div v-if="showInvalid && isInvalid && field.required" class="invalid-feedback d-block">
            Please fill in {{ field.label }}.
        </div>
    </div>
</template>

<script setup lang="ts">
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

// Check if field type is an input type
const isInputType = computed(() => {
    const inputTypes = ['text', 'number', 'date', 'time', 'email', 'tel', 'url', 'password']
    return inputTypes.includes(props.field.type)
})

// Check if field is invalid
const isInvalid = computed(() => {
    if (!props.field.required) return false
    if (props.field.type === 'checkbox') {
        return !props.modelValue
    }
    return !props.modelValue || props.modelValue === ''
})

// Show invalid state
const showInvalid = computed(() => {
    return props.touched && isInvalid.value
})
</script>

