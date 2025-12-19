<template>
    <div class="payment-field mb-4">
        <!-- Payment Status Radio Buttons -->
        <div class="mb-3">
            <label class="form-label">
                <strong>{{ label }}</strong>
                <span v-if="required" class="text-danger">*</span>
            </label>
            <div class="payment-status-radios">
                <div class="form-check">
                    <input
                        :id="`${fieldId}-paid`"
                        type="radio"
                        class="form-check-input"
                        :name="radioName"
                        value="paid"
                        :checked="paymentStatus === 'paid'"
                        @change="handlePaymentStatusChange"
                    />
                    <label class="form-check-label" :for="`${fieldId}-paid`">
                        Paid
                    </label>
                </div>
                <div class="form-check">
                    <input
                        :id="`${fieldId}-unpaid`"
                        type="radio"
                        class="form-check-input"
                        :name="radioName"
                        value="unpaid"
                        :checked="paymentStatus === 'unpaid'"
                        @change="handlePaymentStatusChange"
                    />
                    <label class="form-check-label" :for="`${fieldId}-unpaid`">
                        Unpaid
                    </label>
                </div>
            </div>
            <div v-if="showInvalid && !paymentStatus && required" class="invalid-feedback d-block">
                Please select a payment status.
            </div>
        </div>

        <!-- Conditional Fields: If Paid -->
        <div v-if="paymentStatus === 'paid'" class="payment-paid-fields">
            <!-- Amount Paid -->
            <div class="mb-3">
                <label :for="`${fieldId}-amount`" class="form-label">
                    Amount Paid
                    <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                    <span class="input-group-text">₱</span>
                    <input
                        :id="`${fieldId}-amount`"
                        type="number"
                        class="form-control"
                        :class="{ 'is-invalid': showInvalid && (!amountPaid || amountPaid <= 0) }"
                        :value="amountPaid"
                        placeholder="Enter amount paid"
                        min="0"
                        step="0.01"
                        required
                        @input="handleAmountChange"
                        @blur="touched = true"
                    />
                </div>
                <div v-if="showInvalid && (!amountPaid || amountPaid <= 0)" class="invalid-feedback d-block">
                    Please enter a valid amount paid.
                </div>
            </div>

            <!-- Receipt Upload -->
            <div class="mb-3">
                <FileUpload
                    :field-id="`${fieldId}-receipt`"
                    label="Payment Receipt"
                    description="Upload a photo or image of the payment receipt"
                    :required="true"
                    :accepted-types="['image/jpeg', 'image/jpg', 'image/png', 'image/webp']"
                    :max-size="5 * 1024 * 1024"
                    :multiple="false"
                    :model-value="receiptFiles"
                    @update:model-value="handleReceiptChange"
                />
            </div>
        </div>

        <!-- Conditional Fields: If Unpaid -->
        <div v-else-if="paymentStatus === 'unpaid'" class="payment-not-paid-fields">
            <div class="mb-3">
                <label :for="`${fieldId}-reason`" class="form-label">
                    Reason for Non-Payment
                    <span class="text-danger">*</span>
                </label>
                <textarea
                    :id="`${fieldId}-reason`"
                    class="form-control"
                    :class="{ 'is-invalid': showInvalid && (!reasonNotPaid || reasonNotPaid.trim() === '') }"
                    :value="reasonNotPaid"
                    placeholder="Please provide a reason why payment has not been made..."
                    rows="4"
                    required
                    @input="handleReasonChange"
                    @blur="touched = true"
                ></textarea>
                <div v-if="showInvalid && (!reasonNotPaid || reasonNotPaid.trim() === '')" class="invalid-feedback d-block">
                    Please provide a reason for non-payment.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * PaymentField Component
 * 
 * A custom form field component that handles payment status with conditional fields.
 * 
 * When user selects "Paid":
 * - Shows amount input (with peso symbol)
 * - Shows receipt upload field
 * 
 * When user selects "Unpaid":
 * - Shows textarea for reason why not paid
 * 
 * The component validates that all required fields are filled based on the payment status.
 * To modify validation rules, edit the isValid computed property below.
 */
import { ref, computed, watch } from 'vue'
import FileUpload from './FileUpload.vue'
import './styles/PaymentField.css'

interface Props {
    fieldId: string
    label?: string
    required?: boolean
    modelValue?: {
        paymentStatus: 'paid' | 'unpaid' | null
        amountPaid?: number | null
        receiptFiles?: File[]
        reasonNotPaid?: string
    }
    touched?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    label: 'Payment Status',
    required: false,
    modelValue: () => ({
        paymentStatus: null,
        amountPaid: null,
        receiptFiles: [],
        reasonNotPaid: ''
    }),
    touched: false
})

const emit = defineEmits<{
    'update:modelValue': [value: {
        paymentStatus: 'paid' | 'unpaid' | null
        amountPaid?: number | null
        receiptFiles?: File[]
        reasonNotPaid?: string
    }]
}>()

// Local state - these track the current values
const paymentStatus = ref<'paid' | 'unpaid' | null>(props.modelValue?.paymentStatus || null)
const amountPaid = ref<number | null>(props.modelValue?.amountPaid || null)
const receiptFiles = ref<File[]>(props.modelValue?.receiptFiles || [])
const reasonNotPaid = ref(props.modelValue?.reasonNotPaid || '')
const touched = ref(props.touched)

// Radio buttons need the same name to be grouped together
const radioName = computed(() => `${props.fieldId}-payment-status`)

// Watch for external changes to modelValue (in case parent component updates it)
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        paymentStatus.value = newValue.paymentStatus || null
        amountPaid.value = newValue.amountPaid ?? null
        receiptFiles.value = newValue.receiptFiles || []
        reasonNotPaid.value = newValue.reasonNotPaid || ''
    }
}, { deep: true, immediate: true })

// Watch for touched prop changes (for validation display)
watch(() => props.touched, (newValue) => {
    touched.value = newValue
})

/**
 * Emits the updated value to parent component
 * 
 * This is called whenever any field changes. It only includes relevant data based on
 * payment status - if paid, we don't send reasonNotPaid, and vice versa.
 */
const emitUpdate = () => {
    emit('update:modelValue', {
        paymentStatus: paymentStatus.value,
        // Only include amount and receipt if paid
        amountPaid: paymentStatus.value === 'paid' ? amountPaid.value : null,
        receiptFiles: paymentStatus.value === 'paid' ? receiptFiles.value : [],
        // Only include reason if unpaid
        reasonNotPaid: paymentStatus.value === 'unpaid' ? reasonNotPaid.value : ''
    })
}

/**
 * Handles when user changes payment status (paid/unpaid)
 * 
 * When switching between paid and unpaid, we clear the opposite fields to avoid
 * sending irrelevant data. Also marks the field as touched for validation.
 */
const handlePaymentStatusChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    paymentStatus.value = target.value as 'paid' | 'unpaid'
    
    // Clear opposite fields when switching - no point keeping old data
    if (paymentStatus.value === 'paid') {
        reasonNotPaid.value = ''
    } else if (paymentStatus.value === 'unpaid') {
        amountPaid.value = null
        receiptFiles.value = []
    }
    
    touched.value = true
    emitUpdate()
}

/**
 * Handles amount input changes
 * 
 * Parses the input as a number. If it's not a valid number, sets to null.
 */
const handleAmountChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = parseFloat(target.value)
    amountPaid.value = isNaN(value) ? null : value
    emitUpdate()
}

/**
 * Handles receipt file upload changes
 * 
 * Receives the files array from FileUpload component and updates local state.
 */
const handleReceiptChange = (files: File[]) => {
    receiptFiles.value = files
    emitUpdate()
}

/**
 * Handles reason textarea changes
 * 
 * Updates the reason text when user types in the textarea.
 */
const handleReasonChange = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    reasonNotPaid.value = target.value
    emitUpdate()
}

// Validation logic
/**
 * Whether to show validation errors
 * 
 * Only shows errors after the field has been touched (user interacted with it).
 */
const showInvalid = computed(() => {
    return touched.value
})

/**
 * Validates the entire payment field
 * 
 * If the field is required:
 * - Must have a payment status selected
 * - If paid: must have amount > 0 and at least one receipt file
 * - If unpaid: must have a non-empty reason
 * 
 * To modify validation rules, edit the conditions below.
 */
const isValid = computed(() => {
    // If not required, user can skip this field entirely
    if (!props.required) {
        return true
    }
    
    // Must have a payment status selected
    if (!paymentStatus.value) {
        return false
    }
    
    // Validate based on payment status
    if (paymentStatus.value === 'paid') {
        // If paid, amount must be greater than 0
        if (!amountPaid.value || amountPaid.value <= 0) {
            return false
        }
        // Must have at least one receipt file
        if (!receiptFiles.value || receiptFiles.value.length === 0) {
            return false
        }
    } else if (paymentStatus.value === 'unpaid') {
        // If unpaid, must have a reason (not just whitespace)
        if (!reasonNotPaid.value || reasonNotPaid.value.trim() === '') {
            return false
        }
    }
    
    return true
})

// Expose validation state (useful for parent components)
defineExpose({
    isValid,
    touched: computed(() => touched.value)
})
</script>
