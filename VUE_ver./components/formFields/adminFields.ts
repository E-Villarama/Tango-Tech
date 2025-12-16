import type { FormField } from './types'

export const adminFields: FormField[] = [
    // Page 4: Admin-specific fields (continues after baseFields page 3)
    {
        id: 'adminLicenseNumber',
        key: 'adminLicenseNumber',
        label: 'Admin License Number',
        type: 'text',
        placeholder: 'Enter your admin license number',
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

