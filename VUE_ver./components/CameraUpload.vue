<template>
    <div class="mb-3">
        <label :for="fieldId" class="form-label">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        
        <!-- Camera Capture Button -->
        <div class="d-flex gap-2 mb-2">
            <button
                type="button"
                class="btn btn-primary"
                @click="openCamera"
                :disabled="isCapturing"
            >
                📷 {{ isCapturing ? 'Capturing...' : 'Take Photo' }}
            </button>
            <button
                type="button"
                class="btn btn-outline-secondary"
                @click="openFileInput"
            >
                📁 Upload Photo
            </button>
        </div>
        
        <!-- Hidden file input -->
        <input
            :id="fieldId"
            ref="fileInputRef"
            type="file"
            class="d-none"
            accept="image/*"
            :capture="'environment'"
            :required="required && uploadedFiles.length === 0"
            @change="handleFileChange"
        />
        
        <!-- Camera Preview Modal -->
        <div v-if="showCameraModal" class="camera-modal-overlay" @click="closeCamera">
            <div class="camera-modal-content" @click.stop>
                <div class="camera-modal-header">
                    <h5>Take Photo</h5>
                    <button type="button" class="btn-close" @click="closeCamera"></button>
                </div>
                <div class="camera-modal-body">
                    <video
                        v-if="stream"
                        ref="videoRef"
                        autoplay
                        playsinline
                        class="camera-preview"
                    ></video>
                    <div v-else-if="error" class="alert alert-danger">
                        {{ error }}
                    </div>
                    <div v-else class="text-center p-4">
                        <div class="spinner-border" role="status">
                            <span class="visually-hidden">Loading camera...</span>
                        </div>
                    </div>
                </div>
                <div class="camera-modal-footer">
                    <button
                        type="button"
                        class="btn btn-secondary"
                        @click="closeCamera"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="btn btn-primary"
                        @click="capturePhoto"
                        :disabled="!stream"
                    >
                        📷 Capture Photo
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Photo Preview/List -->
        <div v-if="uploadedFiles.length > 0" class="mt-3">
            <div class="row g-2">
                <div
                    v-for="(file, index) in uploadedFiles"
                    :key="index"
                    class="col-md-4 col-sm-6"
                >
                    <div class="photo-preview-card">
                        <img
                            :src="getImagePreview(file)"
                            :alt="file.name"
                            class="photo-preview-img"
                            @error="handleImageError"
                        />
                        <div class="photo-preview-overlay">
                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                @click="removeFile(index)"
                            >
                                Remove
                            </button>
                        </div>
                        <div class="photo-preview-info">
                            <small class="text-muted">{{ formatFileSize(file.size) }}</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <small v-if="description" class="form-text text-muted d-block mt-2">
            {{ description }}
        </small>
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger mt-2 mb-0" role="alert">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, nextTick } from 'vue'
import './styles/CameraUpload.css'

interface Props {
    fieldId: string
    label: string
    description?: string
    required?: boolean
    maxSize?: number // in bytes, default 10MB
    modelValue?: File[]
}

const props = withDefaults(defineProps<Props>(), {
    required: false,
    maxSize: 10 * 1024 * 1024, // 10MB default
    modelValue: () => []
})

const emit = defineEmits<{
    'update:modelValue': [files: File[]]
}>()

const uploadedFiles = ref<File[]>(Array.isArray(props.modelValue) ? props.modelValue : [])
const errorMessage = ref('')
const showCameraModal = ref(false)
const isCapturing = ref(false)
const stream = ref<MediaStream | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const error = ref('')

// Watch for modelValue changes
watch(() => props.modelValue, (newValue) => {
    uploadedFiles.value = Array.isArray(newValue) ? [...newValue] : []
}, { deep: true, immediate: true })

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getImagePreview = (file: File): string => {
    return URL.createObjectURL(file)
}

const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E'
}

const validateFile = (file: File): boolean => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
        errorMessage.value = 'Please select an image file'
        return false
    }
    
    // Check file size
    if (file.size > props.maxSize) {
        errorMessage.value = `File size exceeds maximum of ${formatFileSize(props.maxSize)}`
        return false
    }
    
    errorMessage.value = ''
    return true
}

const openFileInput = () => {
    fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    
    if (!files || files.length === 0) {
        return
    }
    
    errorMessage.value = ''
    
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (validateFile(file)) {
            validFiles.push(file)
        } else {
            target.value = ''
            return
        }
    }
    
    uploadedFiles.value = [...uploadedFiles.value, ...validFiles]
    emit('update:modelValue', uploadedFiles.value)
    
    // Reset input
    target.value = ''
}

const openCamera = async () => {
    showCameraModal.value = true
    isCapturing.value = true
    error.value = ''
    
    try {
        // Request camera access
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Use back camera on mobile
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        })
        
        stream.value = mediaStream
        
        // Wait for video element to be ready
        await nextTick()
        
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to access camera. Please check permissions.'
        console.error('Camera access error:', err)
    } finally {
        isCapturing.value = false
    }
}

const closeCamera = () => {
    // Stop camera stream
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop())
        stream.value = null
    }
    
    showCameraModal.value = false
    error.value = ''
    
    if (videoRef.value) {
        videoRef.value.srcObject = null
    }
}

const capturePhoto = () => {
    if (!videoRef.value || !stream.value) return
    
    // Create canvas to capture frame
    const canvas = document.createElement('canvas')
    const video = videoRef.value
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
        errorMessage.value = 'Failed to capture photo'
        return
    }
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert canvas to blob
    canvas.toBlob((blob) => {
        if (!blob) {
            errorMessage.value = 'Failed to create image file'
            return
        }
        
        // Create File object from blob
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
        })
        
        if (validateFile(file)) {
            uploadedFiles.value = [...uploadedFiles.value, file]
            emit('update:modelValue', uploadedFiles.value)
            closeCamera()
        }
    }, 'image/jpeg', 0.9) // 90% quality
}

const removeFile = (index: number) => {
    // Revoke object URL to free memory
    const file = uploadedFiles.value[index]
    const url = getImagePreview(file)
    URL.revokeObjectURL(url)
    
    uploadedFiles.value.splice(index, 1)
    emit('update:modelValue', uploadedFiles.value)
}

// Cleanup on unmount
onUnmounted(() => {
    closeCamera()
    
    // Revoke all object URLs
    uploadedFiles.value.forEach(file => {
        URL.revokeObjectURL(getImagePreview(file))
    })
})
</script>

