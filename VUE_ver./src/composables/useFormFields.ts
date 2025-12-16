// Form fields organization composable for OnboardingForm
import { computed, type Ref } from 'vue'
import type { FormField } from '../../components/formFields/types'

export function useFormFields(formFields: FormField[], currentPage: Ref<number>) {
    // Group fields by page
    const fieldsByPage = computed(() => {
        const pages: Record<number, FormField[]> = {}
        
        formFields.forEach(field => {
            const page = field.page || 1 // Default to page 1
            if (!pages[page]) {
                pages[page] = []
            }
            pages[page].push(field)
        })
        
        return pages
    })

    // Get total number of pages
    const totalPages = computed(() => {
        const pageNumbers = Object.keys(fieldsByPage.value).map(Number)
        return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1
    })

    // Group fields into rows based on columnSpan
    const groupFieldsIntoRows = (fields: FormField[]): FormField[][] => {
        const rows: FormField[][] = []
        let currentRow: FormField[] = []
        let currentRowSpan = 0
        
        fields.forEach(field => {
            const span = field.columnSpan || 12
            
            if (currentRowSpan + span > 12 && currentRow.length > 0) {
                rows.push([...currentRow])
                currentRow = []
                currentRowSpan = 0
            }
            
            currentRow.push(field)
            currentRowSpan += span
            
            if (currentRowSpan >= 12) {
                rows.push([...currentRow])
                currentRow = []
                currentRowSpan = 0
            }
        })
        
        if (currentRow.length > 0) {
            rows.push(currentRow)
        }
        
        return rows
    }

    // Get fields for current page and group them into rows
    const currentPageFields = computed(() => {
        const pageFields = fieldsByPage.value[currentPage.value] || []
        return groupFieldsIntoRows(pageFields)
    })

    // Get sorted list of page numbers for review page
    const reviewPages = computed(() => {
        const pages = Object.keys(fieldsByPage.value).map(Number).sort((a, b) => a - b)
        return pages
    })

    return {
        fieldsByPage,
        totalPages,
        currentPageFields,
        reviewPages
    }
}

