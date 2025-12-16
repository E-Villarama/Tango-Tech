// Monitoring form fields - checklist style form for agent site evaluations
// These are placeholder fields - to be customized based on requirements

import type { MonitoringFormField } from '../../src/types/monitoring'

export const monitoringFields: MonitoringFormField[] = [
    // Page 1: Basic Information
    {
        id: 'borrower-visit-date',
        key: 'visitDate',
        label: 'Visit Date',
        type: 'date',
        required: true,
        columnSpan: 6,
        page: 1
    },
    {
        id: 'borrower-visit-time',
        key: 'visitTime',
        label: 'Visit Time',
        type: 'time',
        required: true,
        columnSpan: 6,
        page: 1
    },
    {
        id: 'property-condition',
        key: 'propertyCondition',
        label: 'Property Condition',
        type: 'select',
        required: true,
        placeholder: 'Select property condition',
        options: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
            { value: 'needs-repair', label: 'Needs Repair' }
        ],
        columnSpan: 12,
        page: 1
    },
    
    // Page 2: Checklist Items
    {
        id: 'exterior-inspection',
        key: 'exteriorInspection',
        label: 'Exterior Inspection Completed',
        type: 'checkbox',
        required: true,
        columnSpan: 12,
        page: 2
    },
    {
        id: 'interior-inspection',
        key: 'interiorInspection',
        label: 'Interior Inspection Completed',
        type: 'checkbox',
        required: true,
        columnSpan: 12,
        page: 2
    },
    {
        id: 'photos-taken',
        key: 'photosTaken',
        label: 'Photos Taken',
        type: 'camera',
        required: true,
        description: 'Take photos on-site or upload from your device',
        maxSize: 10 * 1024 * 1024, // 10MB
        columnSpan: 12,
        page: 2
    },
    {
        id: 'notes',
        key: 'notes',
        label: 'Additional Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Enter any additional observations or notes...',
        columnSpan: 12,
        page: 2
    }
]

