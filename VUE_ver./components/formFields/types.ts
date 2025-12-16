// FormField type definition
export interface FormField {
    id: string
    key: string
    label: string
    type: string // 'text', 'email', 'select', 'document', 'multiselect', etc.
    placeholder: string
    required?: boolean
    pattern?: string
    minlength?: number
    options?: Array<{ value: string; label: string }> // For select fields
    columnSpan?: number // Bootstrap columns (1-12, default 12 for full width)
    rowSpan?: number // Number of rows to span (for textarea rows, or height multiplier)
    page?: number // Page number (default: 1) - allows splitting fields across pages
    sectionTitle?: string // Custom title for the page section (used in review page)
    // Document upload specific properties (only used when type === 'document')
    description?: string // Description for document uploads
    acceptedTypes?: string[] // e.g., ['image/jpeg', 'image/png', 'application/pdf']
    maxSize?: number // in bytes
}

