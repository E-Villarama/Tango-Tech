/**
 * Form layout utilities composable for OnboardingForm
 * 
 * Handles all the layout logic for form fields - deciding whether to use CSS Grid
 * or Bootstrap's row/column system, calculating column spans, etc.
 * 
 * The layout system uses Bootstrap's 12-column grid by default, but switches to
 * CSS Grid when fields have dynamic heights (like textareas or document uploads).
 * This prevents layout issues when fields next to each other have different heights.
 * 
 * To modify layout behavior, edit the functions below. For example, if you want to
 * change when CSS Grid is used, edit shouldUseGrid().
 */
import type { FormField } from '../../components/formFields/types'

export function useFormLayout() {
    /**
     * Decides whether a row should use CSS Grid instead of Bootstrap columns
     * 
     * CSS Grid is used when fields might have different heights (like a textarea next to
     * a regular input). This prevents the layout from breaking when one field is taller.
     * 
     * Currently uses Grid if:
     * - Row has multiple fields AND
     * - Any field has rowSpan > 1, is a document, or is a textarea
     * 
     * @param row - Array of fields in the row
     * @returns true if should use CSS Grid, false for Bootstrap
     */
    const shouldUseGrid = (row: FormField[]): boolean => {
        // Single field rows don't need grid
        if (row.length <= 1) return false
        
        // Use grid if any field might have a different height
        return row.some(field => 
            (field.rowSpan && field.rowSpan > 1) || 
            field.type === 'document' ||
            field.type === 'textarea'
        )
    }

    /**
     * Gets the CSS class for a row
     * 
     * Returns either 'form-row-grid' (for CSS Grid) or 'row g-3' (Bootstrap row).
     */
    const getRowClass = (row: FormField[]): string => {
        return shouldUseGrid(row) ? 'form-row-grid' : 'row g-3'
    }

    /**
     * Gets inline styles for CSS Grid rows
     * 
     * Only used when shouldUseGrid returns true. Sets up a single-column grid
     * on mobile, which then switches to multi-column on larger screens via CSS.
     */
    const getRowStyle = (row: FormField[]): string => {
        if (!shouldUseGrid(row)) return ''
        
        // Mobile-first: single column on mobile, then grid on larger screens
        // The actual multi-column layout is handled in CSS media queries
        return `display: grid; grid-template-columns: 1fr; grid-auto-rows: min-content; gap: 0.75rem; align-items: start;`
    }

    /**
     * Gets the CSS class for a field's column
     * 
     * For Bootstrap rows: returns something like 'col-12 col-md-6' (full width on mobile,
     * half width on desktop).
     * 
     * For Grid rows: returns empty string (Grid handles columns via inline styles).
     */
    const getColumnClass = (field: FormField, row: FormField[]): string => {
        if (!shouldUseGrid(row)) {
            const span = field.columnSpan || 12
            // Mobile-first: full width on mobile, then use columnSpan at md breakpoint
            return `col-12 col-md-${span}`
        }
        return '' // CSS Grid handles columns via style
    }

    /**
     * Gets inline styles for fields in CSS Grid rows
     * 
     * Sets the column span and row span for Grid layout. The column span is stored
     * as a CSS variable that gets used in media queries for responsive behavior.
     */
    const getFieldGridStyle = (field: FormField, row: FormField[]): string => {
        if (!shouldUseGrid(row)) return ''
        
        const columnSpan = field.columnSpan || 12
        const rowSpan = field.rowSpan || 1
        
        const styles: string[] = []
        
        // If field spans multiple rows, set that
        if (rowSpan > 1) {
            styles.push(`grid-row: span ${rowSpan}`)
        }
        
        // Store column span as CSS variable (used in desktop media query in CSS)
        styles.push(`--column-span: ${columnSpan}`)
        
        return styles.join('; ')
    }

    /**
     * Gets height style for input fields with rowSpan
     * 
     * For non-grid rows, if a field has rowSpan > 1, we need to manually set its height.
     * This is an approximation - about 2.5rem per row including padding and border.
     * 
     * Textareas handle their own height via the rows attribute, so we skip those.
     */
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

