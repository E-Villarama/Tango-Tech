import type { FormField } from './types'

export const baseFields: FormField[] = [
    // Page 1: Personal Information
    {
        id: 'firstName',
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        columnSpan: 4,
        placeholder: 'Enter your first name',
        required: true,
        page: 1
    },
    {
        id: 'middleName',
        key: 'middleName',
        label: 'Middle Name(s)',
        type: 'text',
        columnSpan: 8,
        placeholder: 'Enter your middle name(s)',
        required: false,
        page: 1
    },
    {
        id: 'lastName',
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Enter your last name',
        required: true,
        page: 1
    },
    {
        id: 'prefix',
        key: 'prefix',
        label: 'Prefix',
        type: 'select',
        columnSpan: 4,
        placeholder: 'Select your prefix',
        required: false,
        page: 1,
        options: [
            { value: 'mr', label: 'Mr.' },
            { value: 'mrs', label: 'Mrs.' },
            { value: 'ms', label: 'Ms.' },
            { value: 'dr', label: 'Dr.' },
            { value: 'prof', label: 'Prof.' },
            { value: 'eng', label: 'Eng.' },
            { value: 'attys', label: 'Attys.' },
        ]
    },
    {
        id: 'birthDate',
        key: 'birthDate',
        label: 'Birth Date',
        type: 'date',
        columnSpan: 4,
        placeholder: 'Enter your birth date',
        required: true,
        page: 1
    },
    {
        id: 'suffix',
        key: 'suffix',
        label: 'Suffix',
        type: 'select',
        columnSpan: 4,
        placeholder: 'Select your suffix',
        required: false,
        page: 1,
        options: [
            { value: 'jr', label: 'Jr.' },
            { value: 'sr', label: 'Sr.' },
            { value: 'ii', label: 'II' },
            { value: 'iii', label: 'III' },
            { value: 'iv', label: 'IV' },
            { value: 'v', label: 'V' },
        ]
    },
    
    // Page 2: Contact Information
    {
        id: 'email',
        key: 'email',
        label: 'Email',
        type: 'email',
        placeholder: 'Enter your email',
        required: true,
        page: 2
    },
    {
        id: 'phoneNumber',
        key: 'phoneNumber',
        label: 'Phone Number',
        type: 'tel',
        columnSpan: 6,
        placeholder: 'Enter your phone number',
        required: true,
        page: 2
    },
    {
        id: "viberNumber",
        key: "viberNumber",
        label: "Viber Number",
        type: "tel",
        columnSpan: 6,
        placeholder: "Enter your Viber number",
        required: false,
        page: 2
    },
    {
        id: "gender",
        key: "gender",
        label: "Gender",
        type: "select",
        placeholder: "Select your gender",
        required: true,
        columnSpan: 6,
        page: 2,
        options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "other", label: "Other" }
        ]
    },
    {
        id: "maritalStatus",
        key: "maritalStatus",
        label: "Marital Status",
        type: "select",
        placeholder: "Select your marital status",
        required: true,
        columnSpan: 6,
        page: 2,
        options: [
            { value: "single", label: "Single" },
            { value: "married", label: "Married" },
            { value: "separated", label: "Separated" },
            { value: "divorced", label: "Annulled" },
            { value: "widowed", label: "Widowed" },
        ]
    },
    
    // Page 3: Address Information
    {
        id: "address",
        key: "address",
        label: "Street Address",
        type: "text",
        placeholder: "Enter your address",
        required: true,
        page: 3
    },
    {
        id: "city",
        key: "city",
        label: "City/Municipality",
        type: "text",
        columnSpan: 4,
        placeholder: "Enter your city",
        required: true,
        page: 3
    },
    {
        id: "province",
        key: "province",
        label: "Province",
        type: "text",
        columnSpan: 4,
        placeholder: "Enter your province",
        required: true,
        page: 3
    },
    {
        id: "barangay",
        key: "barangay",
        label: "Barangay",
        type: "text",
        columnSpan: 4,
        placeholder: "Enter your barangay",
        required: true,
        page: 3
    },
    {
        id: "eWallets",
        key: "eWallet",
        label: "eWallet",
        type: "multiselect",
        placeholder: "What eWallets do you have?",
        required: true,
        page: 3,
        options: [
            { value: "gcash", label: "GCash" },
            { value: "maya-individual", label: "Maya Individual" },
            { value: "maya-business", label: "Maya Business" },
            { value: "starpay", label: "Starpay" },
            { value: "grab", label: "Grab" },
            { value: "shopeepay", label: "ShopeePay" },
            { value: "gotyme", label: "GoTyme" },
            { value: "other", label: "Other" },
            { value: "none", label: "None" },
        ]
    },
]

