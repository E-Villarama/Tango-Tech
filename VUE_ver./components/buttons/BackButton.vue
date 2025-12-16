<template>
    <button class="btn btn-secondary mb-3 back-button" @click="$emit('click')">
        ← {{ label }}
    </button>
</template>

<script setup lang="ts">
interface Props {
    label?: string
}

withDefaults(defineProps<Props>(), {
    label: 'Back'
})

defineEmits<{
    click: []
}>()
</script>

<style scoped>
.back-button {
    width: 100%;
    max-width: 300px;
}
</style>

