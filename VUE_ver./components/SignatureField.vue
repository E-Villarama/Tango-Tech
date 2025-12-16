<template>
    <div class="signature-field-wrapper">
        <label :for="fieldId" class="form-label">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        
        <p class="signature-instructions mb-3">
            Please provide both a drawn signature and type your full legal name below.
        </p>

        <!-- Drawing Canvas (Always Required) -->
        <div class="signature-canvas-container mb-3">
            <label :for="`${fieldId}-canvas`" class="form-label small">
                Draw Your Signature <span class="text-danger">*</span>
            </label>
            <canvas
                ref="canvasRef"
                :id="`${fieldId}-canvas`"
                class="signature-canvas"
                :class="{ 'is-invalid': required && !signatureImage && touchedDraw }"
                @mousedown="startDrawing"
                @mousemove="draw"
                @mouseup="stopDrawing"
                @mouseleave="stopDrawing"
                @touchstart="startDrawing"
                @touchmove="draw"
                @touchend="stopDrawing"
            ></canvas>
            <div class="canvas-actions">
                <button
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    @click="clearSignature"
                >
                    Clear
                </button>
            </div>
            <div v-if="required && !signatureImage && touchedDraw" class="invalid-feedback d-block">
                Please draw your signature.
            </div>
        </div>

        <!-- Typed Name Input (Always Required) -->
        <div class="signature-type-container mb-3">
            <label :for="`${fieldId}-typed`" class="form-label">
                Type Your Full Legal Name <span class="text-danger">*</span>
            </label>
            <input
                :id="`${fieldId}-typed`"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': required && !typedName && touchedType }"
                v-model="typedName"
                placeholder="Type your full legal name"
                @blur="touchedType = true"
                @input="handleTypedNameChange"
            />
            <div v-if="required && !typedName && touchedType" class="invalid-feedback d-block">
                Please type your full legal name.
            </div>
        </div>

        <!-- Consent Checkbox -->
        <div class="signature-consent mt-3">
            <div class="form-check">
                <input
                    :id="`${fieldId}-consent`"
                    class="form-check-input"
                    type="checkbox"
                    v-model="consentGiven"
                    :required="required"
                    :class="{ 'is-invalid': required && !consentGiven && touchedConsent }"
                    @blur="touchedConsent = true"
                />
                <label class="form-check-label" :for="`${fieldId}-consent`">
                    By typing my name and submitting this form, I agree this constitutes my electronic signature and I consent to the terms and conditions.
                    <span v-if="required" class="text-danger">*</span>
                </label>
            </div>
            <div v-if="required && !consentGiven && touchedConsent" class="invalid-feedback d-block">
                You must consent to proceed.
            </div>
        </div>

        <!-- Signature Preview -->
        <div v-if="signatureImage" class="signature-preview mt-3">
            <p class="small text-muted mb-2">Signature Preview:</p>
            <img :src="signatureImage" alt="Signature" class="signature-preview-image" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

interface Props {
    fieldId: string
    label?: string
    required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    label: 'Electronic Signature',
    required: true
})

const emit = defineEmits<{
    'update:signature': [data: {
        signatureImage: string // base64 image (required)
        typedName: string // typed name (required)
        signatureMode: 'both' // Both are always required
        consentGiven: boolean
        signedAt: string
    }]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const signatureImage = ref<string>('')
const typedName = ref('')
const consentGiven = ref(false)
const touchedDraw = ref(false)
const touchedType = ref(false)
const touchedConsent = ref(false)

let lastX = 0
let lastY = 0

// Initialize canvas
onMounted(async () => {
    await nextTick()
    if (canvasRef.value) {
        const canvas = canvasRef.value
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = 200
        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
        }
    }
})

// Drawing functions
const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } => {
    if (!canvasRef.value) return { x: 0, y: 0 }
    
    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    
    if (event instanceof TouchEvent) {
        const touch = event.touches[0] || event.changedTouches[0]
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        }
    } else {
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    }
}

const startDrawing = (event: MouseEvent | TouchEvent) => {
    event.preventDefault()
    if (!canvasRef.value) return
    
    isDrawing.value = true
    touchedDraw.value = true
    const coords = getCoordinates(event)
    lastX = coords.x
    lastY = coords.y
}

const draw = (event: MouseEvent | TouchEvent) => {
    if (!isDrawing.value || !canvasRef.value) return
    event.preventDefault()
    
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    const coords = getCoordinates(event)
    
    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(coords.x, coords.y)
    ctx.stroke()
    
    lastX = coords.x
    lastY = coords.y
    
    // Update signature image
    signatureImage.value = canvasRef.value.toDataURL('image/png')
    emitSignature()
}

const stopDrawing = () => {
    isDrawing.value = false
}

const clearSignature = () => {
    if (!canvasRef.value) return
    const ctx = canvasRef.value.getContext('2d')
    if (ctx) {
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    }
    signatureImage.value = ''
    emitSignature()
}

const handleTypedNameChange = () => {
    emitSignature()
}

// Watch for consent changes
watch(consentGiven, () => {
    emitSignature()
})

// Watch for typed name changes
watch(typedName, () => {
    emitSignature()
})

// Emit signature data
const emitSignature = () => {
    // Only emit if both are provided
    if (signatureImage.value && typedName.value.trim()) {
        const signatureData = {
            signatureMode: 'both' as const,
            consentGiven: consentGiven.value,
            signedAt: new Date().toISOString(),
            signatureImage: signatureImage.value,
            typedName: typedName.value.trim()
        }
        
        emit('update:signature', signatureData)
    } else {
        // Emit empty data if not complete
        const signatureData = {
            signatureMode: 'both' as const,
            consentGiven: consentGiven.value,
            signedAt: new Date().toISOString(),
            signatureImage: signatureImage.value || '',
            typedName: typedName.value.trim() || ''
        }
        
        emit('update:signature', signatureData)
    }
}

// Validation computed
const isValid = () => {
    if (!consentGiven.value) return false
    if (!signatureImage.value) return false
    if (!typedName.value.trim()) return false
    return true
}

// Expose validation for parent
defineExpose({
    isValid
})
</script>

<style scoped>
.signature-field-wrapper {
    margin-bottom: 1.5rem;
}

.signature-instructions {
    color: #6c757d;
    font-size: 0.9375rem;
    line-height: 1.5;
}

.signature-canvas-container {
    border: 2px solid #dee2e6;
    border-radius: 0.375rem;
    padding: 1rem;
    background: white;
}

.signature-canvas {
    width: 100%;
    height: 200px;
    border: 1px dashed #dee2e6;
    border-radius: 0.25rem;
    cursor: crosshair;
    touch-action: none;
    background: white;
    transition: border-color 0.15s ease-in-out;
}

.signature-canvas.is-invalid {
    border-color: #dc3545;
    border-style: solid;
}

.signature-canvas.is-invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
}

.canvas-actions {
    margin-top: 0.75rem;
    display: flex;
    justify-content: flex-end;
}

.signature-type-container {
    margin-bottom: 0;
}

.signature-consent {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.375rem;
    border: 1px solid #dee2e6;
}

.signature-consent .form-check-label {
    font-size: 0.9375rem;
    line-height: 1.5;
    cursor: pointer;
}

.signature-preview {
    padding: 0.75rem;
    background: #f8f9fa;
    border-radius: 0.375rem;
    border: 1px solid #dee2e6;
}

.signature-preview-image {
    max-width: 100%;
    height: auto;
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    background: white;
    padding: 0.5rem;
}

/* Mobile adjustments */
@media (max-width: 767px) {
    .signature-canvas-container {
        padding: 0.75rem;
    }
    
    .signature-canvas {
        height: 180px;
    }
}
</style>

