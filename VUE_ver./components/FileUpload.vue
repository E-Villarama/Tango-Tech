<template>
    <div class="mb-3">
        <label :for="fieldId" class="form-label">
            {{ label }}
            <span v-if="required" class="text-danger">*</span>
        </label>
        <input
            :id="fieldId"
            type="file"
            class="form-control"
            :accept="acceptedTypes.join(',')"
            :required="required && !hasFile"
            :multiple="multiple"
            @change="handleFileChange"
        />
        <small class="form-text text-muted" v-if="description">
            {{ description }}
        </small>
        <small class="form-text text-muted">
            Accepted: {{ acceptedTypesDisplay }} | Max size: {{ maxSizeDisplay }}
        </small>
        
        <!-- File Preview/List -->
        <div v-if="uploadedFiles.length > 0" class="mt-2">
            <div 
                v-for="(file, index) in uploadedFiles" 
                :key="index"
                class="d-flex align-items-center justify-content-between border rounded p-2 mb-2"
            >
                <div class="d-flex align-items-center">
                    <span class="me-2">📄</span>
                    <div>
                        <div class="fw-bold">{{ file.name }}</div>
                        <small class="text-muted">{{ formatFileSize(file.size) }}</small>
                    </div>
                </div>
                <button 
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="removeFile(index)"
                >
                    Remove
                </button>
            </div>
        </div>
        
        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger mt-2 mb-0" role="alert">
            {{ errorMessage }}
        </div>
    </div>
</template>

<script setup lang="ts">
/**
 * FileUpload Component
 * 
 * Handles file uploads with validation for file type and size. Shows a preview list
 * of uploaded files with the ability to remove them. Used for document uploads in forms.
 * 
 * The component validates files before accepting them - checks both file type (MIME type)
 * and file size. If validation fails, it shows an error message and clears the input.
 * 
 * To modify accepted file types or size limits, change the props passed to this component
 * from the parent (usually from the field definition).
 */
import { ref, computed } from 'vue'
import './styles/FileUpload.css'

interface Props {
    fieldId: string
    label: string
    description?: string
    required?: boolean
    acceptedTypes: string[] // MIME types like ['image/jpeg', 'application/pdf']
    maxSize: number // Maximum file size in bytes
    multiple?: boolean // Whether to allow multiple files
    modelValue?: File[] // Current uploaded files
}

const props = withDefaults(defineProps<Props>(), {
    required: false,
    multiple: false,
    modelValue: () => []
})

const emit = defineEmits<{
    'update:modelValue': [files: File[]]
}>()

// Local state
const uploadedFiles = ref<File[]>(props.modelValue || [])
const errorMessage = ref('')

/**
 * Whether at least one file has been uploaded
 * 
 * Used to determine if the required validation should apply.
 */
const hasFile = computed(() => uploadedFiles.value.length > 0)

/**
 * Formats accepted file types for display
 * 
 * Converts MIME types like 'image/jpeg' to 'JPEG' for better readability.
 * Special handling for PDFs to show as 'PDF' instead of 'PDF' from 'application/pdf'.
 */
const acceptedTypesDisplay = computed(() => {
    return props.acceptedTypes.map(type => {
        if (type.startsWith('image/')) return type.split('/')[1].toUpperCase()
        if (type.startsWith('application/')) {
            if (type.includes('pdf')) return 'PDF'
            return type.split('/')[1].toUpperCase()
        }
        return type
    }).join(', ')
})

/**
 * Formats max file size for display
 * 
 * Converts bytes to human-readable format (KB, MB, GB).
 */
const maxSizeDisplay = computed(() => {
    return formatFileSize(props.maxSize)
})

/**
 * Converts bytes to human-readable file size string
 * 
 * Examples: 1024 bytes -> "1 KB", 1048576 bytes -> "1 MB"
 * 
 * @param bytes - File size in bytes
 * @returns Formatted string like "1.5 MB"
 */
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validates a file against type and size restrictions
 * 
 * Checks:
 * 1. File MIME type is in the acceptedTypes list
 * 2. File size doesn't exceed maxSize
 * 
 * Sets errorMessage if validation fails.
 * 
 * @param file - File to validate
 * @returns true if valid, false otherwise
 */
const validateFile = (file: File): boolean => {
    // Check file type matches accepted types
    if (!props.acceptedTypes.includes(file.type)) {
        errorMessage.value = `File type not allowed. Accepted types: ${acceptedTypesDisplay.value}`
        return false
    }
    
    // Check file size doesn't exceed maximum
    if (file.size > props.maxSize) {
        errorMessage.value = `File size exceeds maximum of ${maxSizeDisplay.value}`
        return false
    }
    
    // Clear any previous errors if validation passes
    errorMessage.value = ''
    return true
}

/**
 * Handles file input change event
 * 
 * When user selects files, validates each one. If all are valid, adds them to the
 * uploaded files list. If any fail validation, shows error and clears the input.
 * 
 * For multiple file mode, adds to existing files. For single file mode, replaces them.
 */
const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    
    if (!files || files.length === 0) {
        return
    }
    
    errorMessage.value = ''
    
    // Validate all selected files
    const validFiles: File[] = []
    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (validateFile(file)) {
            validFiles.push(file)
        } else {
            // If any file fails validation, clear the input and stop
            target.value = ''
            return
        }
    }
    
    // Add valid files to the list
    if (props.multiple) {
        // Multiple mode: add to existing files
        uploadedFiles.value = [...uploadedFiles.value, ...validFiles]
    } else {
        // Single mode: replace existing files
        uploadedFiles.value = validFiles
    }
    
    // Emit updated file list to parent
    emit('update:modelValue', uploadedFiles.value)
}

/**
 * Removes a file from the uploaded files list
 * 
 * Called when user clicks the "Remove" button on a file preview.
 * 
 * @param index - Index of the file to remove
 */
const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
    emit('update:modelValue', uploadedFiles.value)
}
</script>

