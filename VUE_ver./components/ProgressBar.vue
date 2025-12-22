<template>
    <div v-if="totalPages > 1 || currentPage === totalPages + 1" class="page-progress mb-4">
        <div class="progress-bar">
            <div 
                class="progress-fill" 
                :style="{ width: currentPage === totalPages + 1 ? '100%' : `${(currentPage / totalPages) * 100}%` }"
            ></div>
        </div>
        <p class="page-indicator">
            <span v-if="currentPage === totalPages + 1">{{ reviewPageLabel }}</span>
            <span v-else>Page {{ currentPage }} of {{ totalPages }}</span>
        </p>
    </div>
</template>

<script setup lang="ts">
interface Props {
    currentPage: number
    totalPages: number
    reviewPageLabel?: string
}

withDefaults(defineProps<Props>(), {
    reviewPageLabel: 'Review Form'
})
</script>

<style scoped>
@import './styles/ProgressBar.css';
</style>

