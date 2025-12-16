import type { FormField } from './types'

export const supervisorFields: FormField[] = [
    // Page 4: Supervisor-specific fields (continues after baseFields page 3)
    {
        id: 'supervisorLicenseNumber',
        key: 'supervisorLicenseNumber',
        label: 'Supervisor License Number',
        type: 'text',
        placeholder: 'Enter your supervisor license number',
        required: true,
        page: 4
    },
    {
        id: 'supervisorRole',
        key: 'supervisorRole',
        label: 'Supervisor Role',
        type: 'text',
        placeholder: 'Enter your admin role',
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

