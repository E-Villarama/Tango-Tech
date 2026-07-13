<template>
    <div class="form-navigation">
        <button 
            v-if="showPrevious && currentPage > 1"
            type="button"
            class="btn btn-outline-secondary btn-nav"
            @click="$emit('previous')"
            :disabled="disabled || isSubmitting"
        >
            ← Previous
        </button>
        
        <button 
            v-if="currentPage < totalPages"
            type="button"
            class="btn btn-primary btn-nav"
            @click="$emit('next')"
            :disabled="disabled || disableForward || isSubmitting"
        >
            Next →
        </button>
        <button 
            v-else-if="currentPage === totalPages"
            type="button"
            class="btn btn-primary btn-nav"
            @click="$emit('review')"
            :disabled="disabled || disableForward || isSubmitting"
        >
            Review →
        </button>
        <button
            v-if="currentPage === totalPages + 1"
            type="submit"
            class="btn btn-primary btn-nav"
            :disabled="disabled || disableForward || isSubmitting"
            @click="$emit('submit')"
        >
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            {{ isSubmitting ? submittingText : submitText }}
        </button>
    </div>
</template>

<script setup lang="ts">
interface Props {
    currentPage: number
    totalPages: number
    disabled?: boolean
    disableForward?: boolean  // Specifically for Next/Review/Submit buttons
    isSubmitting?: boolean
    showPrevious?: boolean
    submitText?: string
    submittingText?: string
}

withDefaults(defineProps<Props>(), {
    disabled: false,
    disableForward: false,
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

