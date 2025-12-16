import type { FormField } from './types'

export const lenderFields: FormField[] = [
    // Page 4: Lender-specific fields (continues after baseFields page 3)
    {
        id: 'institutionName',
        key: 'institutionName',
        label: 'Institution Name',
        type: 'text',
        placeholder: 'Enter your institution name',
        required: true,
        page: 4
    },
    {
        id: 'maxLoanAmount',
        key: 'maxLoanAmount',
        label: 'Maximum Loan Amount',
        type: 'number',
        placeholder: 'Enter maximum loan amount',
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

