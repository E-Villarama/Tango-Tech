<template>
    <div class="form-navigation">
        <button 
            v-if="showPrevious && currentPage > 1"
            type="button"
            class="btn btn-outline-secondary"
            @click="$emit('previous')"
            :disabled="disabled || isSubmitting"
        >
            ← Previous
        </button>
        
        <div class="navigation-actions">
            <button 
                v-if="currentPage < totalPages"
                type="button"
                class="btn btn-primary"
                @click="$emit('next')"
                :disabled="disabled || isSubmitting"
            >
                Next →
            </button>
            <button 
                v-else-if="currentPage === totalPages"
                type="button"
                class="btn btn-primary"
                @click="$emit('review')"
                :disabled="disabled || isSubmitting"
            >
                Review →
            </button>
            <button
                v-if="currentPage === totalPages + 1"
                type="submit"
                class="btn btn-primary"
                :disabled="disabled || isSubmitting"
                @click="$emit('submit')"
            >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isSubmitting ? submittingText : submitText }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
interface Props {
    currentPage: number
    totalPages: number
    disabled?: boolean
    isSubmitting?: boolean
    showPrevious?: boolean
    submitText?: string
    submittingText?: string
}

withDefaults(defineProps<Props>(), {
    disabled: false,
    isSubmitting: false,
    showPrevious: true,
    submitText: 'Submit Form',
    submittingText: 'Submitting...'
})

defineEmits<{
    previous: []
    next: []
    review: []
    submit: []
}>()
</script>

