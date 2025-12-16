import type { FormField } from './types'

export const borrowerFields: FormField[] = [
    // Page 4: Borrower-specific fields (continues after baseFields page 3)
    {
        id: 'loanAmount',
        key: 'loanAmount',
        label: 'Desired Loan Amount',
        type: 'number',
        placeholder: 'Enter desired loan amount',
        required: true,
        page: 4
    },
    {
        id: 'purpose',
        key: 'purpose',
        label: 'Loan Purpose',
        type: 'text',
        placeholder: 'Describe the purpose of the loan',
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

