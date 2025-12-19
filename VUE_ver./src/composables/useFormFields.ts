/**
 * Form fields organization composable for OnboardingForm
 * 
 * This handles organizing fields into pages and rows. It groups fields by their page number,
 * figures out how many total pages there are, and arranges fields into rows based on their
 * columnSpan (Bootstrap grid system - 12 columns total).
 * 
 * The row grouping is important for layout - fields with columnSpan 6 will sit side-by-side,
 * fields with columnSpan 12 take the full width, etc.
 */
import { computed, type Ref } from 'vue'
import type { FormField } from '../../components/formFields/types'

export function useFormFields(formFields: FormField[], currentPage: Ref<number>) {
    /**
     * Groups all fields by their page number
     * 
     * Creates an object where keys are page numbers and values are arrays of fields.
     * Fields without a page number default to page 1.
     */
    const fieldsByPage = computed(() => {
        const pages: Record<number, FormField[]> = {}
        
        formFields.forEach(field => {
            const page = field.page || 1 // Default to page 1 if not specified
            if (!pages[page]) {
                pages[page] = []
            }
            pages[page].push(field)
        })
        
        return pages
    })

    /**
     * Calculates the total number of pages in the form
     * 
     * Just finds the highest page number from all the fields.
     */
    const totalPages = computed(() => {
        const pageNumbers = Object.keys(fieldsByPage.value).map(Number)
        return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1
    })

    /**
     * Groups fields into rows based on their columnSpan
     * 
     * This uses Bootstrap's 12-column grid system. Each field has a columnSpan (defaults to 12
     * for full width). Fields are grouped into rows, and when a row would exceed 12 columns,
     * we start a new row.
     * 
     * Example: Two fields with columnSpan 6 will be in the same row (6+6=12).
     * A field with columnSpan 12 will be in its own row.
     * 
     * @param fields - Array of fields to group into rows
     * @returns Array of rows, where each row is an array of fields
     */
    const groupFieldsIntoRows = (fields: FormField[]): FormField[][] => {
        const rows: FormField[][] = []
        let currentRow: FormField[] = []
        let currentRowSpan = 0 // Track how many columns we've used in current row
        
        fields.forEach(field => {
            const span = field.columnSpan || 12 // Default to full width
            
            // If adding this field would exceed 12 columns, start a new row
            if (currentRowSpan + span > 12 && currentRow.length > 0) {
                rows.push([...currentRow])
                currentRow = []
                currentRowSpan = 0
            }
            
            currentRow.push(field)
            currentRowSpan += span
            
            // If we've exactly filled a row (12 columns), close it and start a new one
            if (currentRowSpan >= 12) {
                rows.push([...currentRow])
                currentRow = []
                currentRowSpan = 0
            }
        })
        
        // Don't forget the last row if it has fields but didn't fill 12 columns
        if (currentRow.length > 0) {
            rows.push(currentRow)
        }
        
        return rows
    }

    /**
     * Gets fields for the current page and groups them into rows
     * 
     * This is what the form actually uses to render fields - it gets the fields for
     * the current page and arranges them into rows for layout.
     */
    const currentPageFields = computed(() => {
        const pageFields = fieldsByPage.value[currentPage.value] || []
        return groupFieldsIntoRows(pageFields)
    })

    /**
     * Gets a sorted list of all page numbers
     * 
     * Used for the review page to know which pages to show in order.
     */
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

