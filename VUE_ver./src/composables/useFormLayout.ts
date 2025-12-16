// Form layout utilities composable for OnboardingForm
import type { FormField } from '../../components/formFields/types'

export function useFormLayout() {
    // Check if row should use CSS Grid (for dynamic height handling)
    const shouldUseGrid = (row: FormField[]): boolean => {
        // Use grid if row has multiple fields (side-by-side) and any might have different heights
        if (row.length <= 1) return false
        
        // Use grid if any field has rowSpan, is a document, or is a textarea
        return row.some(field => 
            (field.rowSpan && field.rowSpan > 1) || 
            field.type === 'document' ||
            field.type === 'textarea'
        )
    }

    // Get row class - use CSS Grid for dynamic heights, Bootstrap row for simple layouts
    const getRowClass = (row: FormField[]): string => {
        return shouldUseGrid(row) ? 'form-row-grid' : 'row g-3'
    }

    // Get row style for CSS Grid
    const getRowStyle = (row: FormField[]): string => {
        if (!shouldUseGrid(row)) return ''
        
        // Mobile-first: single column on mobile, then grid on larger screens
        return `display: grid; grid-template-columns: 1fr; grid-auto-rows: min-content; gap: 0.75rem; align-items: start;`
    }

    // Get column class - Bootstrap for simple rows, grid for dynamic rows
    const getColumnClass = (field: FormField, row: FormField[]): string => {
        if (!shouldUseGrid(row)) {
            const span = field.columnSpan || 12
            // Mobile-first: full width on mobile, then use columnSpan at md breakpoint
            return `col-12 col-md-${span}`
        }
        return '' // CSS Grid handles columns via style
    }

    // Get field grid style for CSS Grid rows
    const getFieldGridStyle = (field: FormField, row: FormField[]): string => {
        if (!shouldUseGrid(row)) return ''
        
        const columnSpan = field.columnSpan || 12
        const rowSpan = field.rowSpan || 1
        
        const styles: string[] = []
        
        if (rowSpan > 1) {
            styles.push(`grid-row: span ${rowSpan}`)
        }
        
        // Set CSS variable for column span (used in desktop media query)
        styles.push(`--column-span: ${columnSpan}`)
        
        return styles.join('; ')
    }

    // Get input height style based on rowSpan (for non-grid rows)
    const getInputHeightStyle = (field: FormField): string => {
        if (field.rowSpan && field.rowSpan > 1 && field.type !== 'textarea') {
            // Approximate height: ~2.5rem per row (including padding and border)
            const height = field.rowSpan * 2.5
            return `height: ${height}rem; resize: vertical;`
        }
        return ''
    }

    return {
        getRowClass,
        getRowStyle,
        getColumnClass,
        getFieldGridStyle,
        getInputHeightStyle
    }
}

