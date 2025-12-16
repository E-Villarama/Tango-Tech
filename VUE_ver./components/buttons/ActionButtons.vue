<template>
    <div class="form-actions">
        <button 
            v-if="showSaveProgress"
            type="button" 
            class="btn btn-outline-primary btn-action"
            @click="$emit('save-progress')"
            :disabled="disabled || isSubmitting"
        >
            💾 Save Progress
        </button>
        <button 
            v-if="showReset"
            type="button" 
            class="btn btn-outline-secondary btn-action"
            @click="$emit('reset')"
            :disabled="disabled || isSubmitting"
        >
            Reset Form
        </button>
    </div>
</template>

<script setup lang="ts">
interface Props {
    showSaveProgress?: boolean
    showReset?: boolean
    disabled?: boolean
    isSubmitting?: boolean
}

withDefaults(defineProps<Props>(), {
    showSaveProgress: true,
    showReset: true,
    disabled: false,
    isSubmitting: false
})

defineEmits<{
    'save-progress': []
    reset: []
}>()
</script>

