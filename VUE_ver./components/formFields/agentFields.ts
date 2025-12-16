import type { FormField } from './types'

export const agentFields: FormField[] = [
    // Page 4: Agent-specific fields (continues after baseFields page 3)
    {
        id: 'idType',
        key: 'idType',
        label: 'ID Type',
        type: 'select',
        placeholder: 'Select your ID type',
        required: true,
        columnSpan: 8,
        page: 4,
        options: [
            { value: 'drivers-license', label: 'Driver\'s License' },
            { value: 'passport', label: 'Passport' },
            { value: 'sss', label: 'Social Security System (SSS) Card' },
            { value: 'philhealth', label: 'PhilHealth Card' },
            { value: 'philsys', label: 'PhilSys Card' },
            { value: 'pagibig', label: 'Pag-IBIG Card' },
            { value: 'other', label: 'Other' }
        ]
    },
    {
        id: 'idDocument',
        key: 'idDocument',
        label: 'ID Upload',
        type: 'document',
        placeholder: '',
        columnSpan: 4,
        required: true,
        page: 4,
        description: 'Upload a valid government-issued ID (Driver\'s License, Passport, etc.)',
        acceptedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
        maxSize: 5 * 1024 * 1024 // 5MB
    },
    // Page 5: E-Signature (last page before submission)
    {
        id: 'eSignature',
        key: 'eSignature',
        label: 'Electronic Signature',
        type: 'signature',
        placeholder: '',
        required: true,
        page: 5
    }
]

