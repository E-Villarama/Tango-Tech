<template>
    <div class="multiselect-wrapper" :data-field-id="fieldId">
        <label :for="fieldId" class="form-label">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        
        <!-- Selected Items Display (Chips) -->
        <div v-if="selectedValues.length > 0" class="selected-items mb-2">
            <span
                v-for="(value, index) in selectedValues"
                :key="value"
                class="badge bg-primary me-2 mb-2 selected-chip"
            >
                {{ getOptionLabel(value) }}
                <button
                    type="button"
                    class="btn-close btn-close-white ms-2"
                    @click.stop="removeSelection(value)"
                    aria-label="Remove"
                ></button>
            </span>
        </div>
        
        <!-- Native-style Select Button -->
        <div class="multiselect-container">
            <div
                :id="fieldId"
                class="form-select multiselect-select"
                :class="{ 
                    'is-invalid': required && selectedValues.length === 0 && touched,
                    'is-open': isOpen
                }"
                @click="isOpen = !isOpen"
                @blur="handleBlur"
                tabindex="0"
                role="combobox"
                :aria-expanded="isOpen"
                :aria-haspopup="true"
            >
                <span v-if="selectedValues.length === 0" class="text-muted">
                    {{ placeholder }}
                </span>
                <span v-else>
                    {{ selectedValues.length }} {{ selectedValues.length === 1 ? 'item' : 'items' }} selected
                </span>
            </div>
            
            <!-- Dropdown Menu (shown when open) -->
            <div 
                v-if="isOpen" 
                class="multiselect-dropdown"
                @mousedown.prevent
            >
                <div class="multiselect-options">
                    <label
                        v-for="option in options"
                        :key="option.value"
                        class="multiselect-option"
                    >
                        <input
                            type="checkbox"
                            :checked="isSelected(option.value)"
                            @change="toggleSelection(option.value)"
                            class="form-check-input me-2"
                        />
                        <span>{{ option.label }}</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Other Text Input (shown when "other" is selected) -->
        <div v-if="isOtherSelected" class="mt-3">
            <label :for="`${fieldId}-other`" class="form-label">
                Please specify <span class="text-danger">*</span>
            </label>
            <input
                :id="`${fieldId}-other`"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': required && !otherText && touchedOther }"
                v-model="otherText"
                :required="isOtherSelected"
                placeholder="Enter your other option"
                @blur="touchedOther = true"
                @input="handleOtherTextChange"
            />
            <div v-if="required && !otherText && touchedOther" class="invalid-feedback d-block">
                Please specify your other option.
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import './styles/Multiselect.css'

interface Option {
    value: string
    label: string
}

interface Props {
    fieldId: string
    label: string
    placeholder?: string
    required?: boolean
    options: Option[]
    modelValue?: string[]
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'Select options',
    required: false,
    modelValue: () => []
})

const emit = defineEmits<{
    'update:modelValue': [values: string[]]
    'update:otherText': [text: string]
}>()

const isOpen = ref(false)
const touched = ref(false)
const touchedOther = ref(false)
const selectedValues = ref<string[]>(props.modelValue || [])
const otherText = ref('')

const isOtherSelected = computed(() => {
    return selectedValues.value.includes('other')
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        if (selectedValues.value.length > 0) {
            selectedValues.value = []
        }
        return
    }
    
    // Only update if the values are actually different (prevent circular updates)
    const currentValues = selectedValues.value.slice().sort().join(',')
    const newValues = [...newValue].sort().join(',')
    
    if (currentValues !== newValues) {
        selectedValues.value = [...newValue]
    }
}, { deep: true })

// Emit changes when selection changes (only if different from prop)
watch(selectedValues, (newValue) => {
    const currentProp = props.modelValue || []
    const currentPropStr = [...currentProp].sort().join(',')
    const newValueStr = [...newValue].sort().join(',')
    
    // Only emit if the value has actually changed
    if (currentPropStr !== newValueStr) {
        emit('update:modelValue', [...newValue])
    }
}, { deep: true })

const handleBlur = (event: FocusEvent) => {
    // Delay closing to allow checkbox clicks
    setTimeout(() => {
        const relatedTarget = event.relatedTarget as HTMLElement
        const currentTarget = event.currentTarget as HTMLElement
        const wrapper = currentTarget?.closest('.multiselect-wrapper')
        if (!relatedTarget || (wrapper && !wrapper.contains(relatedTarget))) {
            isOpen.value = false
            touched.value = true
        }
    }, 200)
}


const toggleSelection = (value: string) => {
    const index = selectedValues.value.indexOf(value)
    const isExclusiveOption = value === 'none' || value === 'other'
    
    if (index > -1) {
        // Deselecting
        selectedValues.value.splice(index, 1)
        // Clear other text if deselecting "other"
        if (value === 'other') {
            otherText.value = ''
            emit('update:otherText', '')
        }
    } else {
        // Selecting
        if (isExclusiveOption) {
            // If selecting "none" or "other", clear all other selections
            selectedValues.value = [value]
            // Clear other text if selecting "none"
            if (value === 'none') {
                otherText.value = ''
                emit('update:otherText', '')
            }
        } else {
            // If selecting a regular option, remove "none" and "other" if they exist
            selectedValues.value = selectedValues.value.filter(v => v !== 'none' && v !== 'other')
            selectedValues.value.push(value)
            // Clear other text when selecting regular option
            otherText.value = ''
            emit('update:otherText', '')
        }
    }
    touched.value = true
    if (value === 'other') {
        touchedOther.value = false // Reset touched state when selecting other
    }
}

const handleOtherTextChange = () => {
    emit('update:otherText', otherText.value)
    touchedOther.value = true
}

const removeSelection = (value: string) => {
    const index = selectedValues.value.indexOf(value)
    if (index > -1) {
        selectedValues.value.splice(index, 1)
        // Clear other text if removing "other"
        if (value === 'other') {
            otherText.value = ''
            emit('update:otherText', '')
            touchedOther.value = false
        }
    }
    touched.value = true
}

const isSelected = (value: string): boolean => {
    return selectedValues.value.includes(value)
}

const getOptionLabel = (value: string): string => {
    const option = props.options.find(opt => opt.value === value)
    return option ? option.label : value
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const wrapper = document.querySelector(`.multiselect-wrapper[data-field-id="${props.fieldId}"]`)
    if (wrapper && !wrapper.contains(target)) {
        isOpen.value = false
    }
}

// Use capture phase to catch clicks before they reach other elements
if (typeof document !== 'undefined') {
    document.addEventListener('click', handleClickOutside, true)
}
</script>
