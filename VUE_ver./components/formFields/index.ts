// Export all form field arrays from a single entry point
export { baseFields } from './baseFields'
export { agentFields } from './agentFields'
export { borrowerFields } from './borrowerFields'
// Temporarily disabled - focusing on Agent and Borrower only
// export { lenderFields } from './lenderFields'
// export { supervisorFields } from './supervisorFields'
// export { partnerFields } from './partnerFields'
// export { adminFields } from './adminFields'

// Export the FormField type
export type { FormField } from './types'

// Section titles for each form type and page
// Maps formType -> page number -> section title
import type { FormType } from '../../src/types/formTypes'

export const sectionTitles: Record<FormType, Record<number, string>> = {
    agent: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Identification & Documents',
        5: 'E-Signature'
    },
    borrower: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Loan Information',
        5: 'E-Signature'
    },
    // Temporarily disabled - focusing on Agent and Borrower only
    lender: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Business Information',
        5: 'E-Signature'
    },
    supervisor: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Supervisor Information',
        5: 'E-Signature'
    },
    partner: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Partner Information',
        5: 'E-Signature'
    },
    admin: {
        1: 'Personal Information',
        2: 'Contact Information',
        3: 'Address Information',
        4: 'Admin Information',
        5: 'E-Signature'
    }
}

// Helper function to get section title for a form type and page
export const getSectionTitle = (formType: FormType, page: number): string => {
    return sectionTitles[formType]?.[page] || `Page ${page}`
}

