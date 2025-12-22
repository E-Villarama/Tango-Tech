<template>
    <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        @click="$emit('click')"
    >
        Edit
    </button>
</template>

<script setup lang="ts">
defineEmits<{
    click: []
}>()
</script>

