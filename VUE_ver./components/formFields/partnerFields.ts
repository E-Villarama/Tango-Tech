import type { FormField } from './types'

export const partnerFields: FormField[] = [
    // Page 4: Partner-specific fields (continues after baseFields page 3)
    {
        id: 'partnerLicenseNumber',
        key: 'partnerLicenseNumber',
        label: 'Partner License Number',
        type: 'text',
        placeholder: 'Enter your partner license number',
        required: true,
        page: 4
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

