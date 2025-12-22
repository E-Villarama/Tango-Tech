<template>
    <button 
        type="submit" 
        class="btn btn-primary btn-submit"
        :disabled="disabled || isSubmitting"
    >
        <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        {{ isSubmitting ? submittingText : submitText }}
    </button>
</template>

<script setup lang="ts">
interface Props {
    submitText?: string
    submittingText?: string
    disabled?: boolean
    isSubmitting?: boolean
}

withDefaults(defineProps<Props>(), {
    submitText: 'Submit Form',
    submittingText: 'Submitting...',
    disabled: false,
    isSubmitting: false
})
</script>

