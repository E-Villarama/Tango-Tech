<template>
    <div class="review-page">
        <h2 class="review-title mb-4">Review Your Submission</h2>
        <p class="text-muted mb-4">Please review all information before submitting.</p>
        
        <!-- Review Sections -->
        <div 
            v-for="(section, index) in sections" 
            :key="`section-${index}`" 
            class="review-section mb-4"
        >
            <div class="review-section-header">
                <h5 class="review-section-title">{{ section.title }}</h5>
                <EditButton v-if="section.onEdit" @click="section.onEdit()" />
            </div>
            <div v-for="(item, itemIndex) in section.items" :key="`item-${itemIndex}`" class="review-item">
                <strong>{{ item.label }}:</strong>
                <span>{{ item.value }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import EditButton from './buttons/EditButton.vue'

interface ReviewItem {
    label: string
    value: string
}

interface ReviewSection {
    title: string
    items: ReviewItem[]
    onEdit?: () => void
}

interface Props {
    sections: ReviewSection[]
}

defineProps<Props>()
</script>

