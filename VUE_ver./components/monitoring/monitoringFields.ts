// Monitoring form fields - checklist style form for agent site evaluations
// These are placeholder fields - to be customized based on requirements

import type { MonitoringFormField } from '../../src/types/monitoring'

export const monitoringFields: MonitoringFormField[] = [
    // Page 1: Basic Information
    
    {
        id: 'email',
        key: 'email',
        label: 'Email',
        type: 'text',
        required: true,
        columnSpan: 12,
        page: 1,
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    },
    { 

        id: 'customer-phone-number',
        key: 'customerPhoneNumber',
        label: 'Customer Phone Number',
        type: 'tel',
        required: true,
        columnSpan: 8,
        page: 1,
        pattern: '^[0-9]{10}$'
    },
    
    {
        id: 'customer-qr-code',
        key: 'customerQR',
        label: 'Customer QR Code',
        type: 'text',
        required: true,
        columnSpan: 4,
        page: 1,
    },
    
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
    
    // Page 2: Payment
    {
        id: 'payment',
        key: 'payment',
        label: 'Payment',
        type: 'payment',
        required: true,
        columnSpan: 12,
        page: 2
    },
    
    // Page 3: Proof of visit
    {
        id: 'photos-taken',
        key: 'photosTaken',
        label: 'Proof of Visit',
        type: 'camera',
        required: true,
        description: 'Take photos on-site or upload from your device',
        maxSize: 10 * 1024 * 1024, // 10MB
        columnSpan: 12,
        page: 3
    },
    {
        id: 'notes',
        key: 'notes',
        label: 'Additional Notes',
        type: 'textarea',
        required: false,
        placeholder: 'Enter any additional observations or notes...',
        columnSpan: 12,
        page: 3
    },

    // Page 4: Signature
    {
        id: 'signature',
        key: 'signature',
        label: 'Signature',
        type: 'signature',
        required: true,
        columnSpan: 12,
        page: 4
    }
]

