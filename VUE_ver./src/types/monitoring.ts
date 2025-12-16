// Types for monitoring form submissions

export interface MonitoringFormData {
    [key: string]: any // Form field values
}

export interface LocationData {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: string
    address?: string // Optional: reverse geocoded address
}

export interface MonitoringSubmission {
    id?: string // Generated on submission
    borrowerId: string // ID of the borrower this form is for
    borrowerName?: string // Name of borrower (for display)
    agentId: string // ID of the agent submitting
    formData: MonitoringFormData
    location: LocationData
    submittedAt: Date
    visitNumber?: number // Which visit this is for this borrower
}

export interface MonitoringFormField {
    id: string
    key: string
    label: string
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date' | 'time' | 'camera'
    placeholder?: string
    required?: boolean
    options?: Array<{ value: string; label: string }> // For select fields
    columnSpan?: number // Bootstrap columns (1-12)
    page?: number // For multi-page forms
    description?: string // For camera upload fields
    maxSize?: number // Max file size in bytes for camera uploads
}

