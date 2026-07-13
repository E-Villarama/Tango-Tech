# Test User Credentials

This document lists all available test user accounts for the Tango application.


## Available Test Users

### 1. John Agent (No Form Submitted)
- **Phone:** `1`
- **Password:** `123`
- **Status:** No form submitted - can access all forms
- **Use Case:** Test form selection and submission flow

### 2. Jane Borrower (Awaiting Verification)
- **Phone:** `2`
- **Password:** `123`
- **Status:** Borrower form submitted, awaiting verification
- **Use Case:** Test awaiting verification screen

### 3. Charlie Lender (Verified)
- **Phone:** `123`
- **Password:** `123`
- **Status:** Lender form submitted and verified
- **Use Case:** Test verified dashboard

### 4. Admin 
- **Phone:** `admin`
- **Password:** `admin`
- **Status:** Agent form submitted, 
- **Use Case:** Testing user flow rather than valid inputs

## How to Modify Test Users

Edit the `testUsers` array in `src/config/testUsers.ts`:

```typescript
export const testUsers: TestUser[] = [
  {
    phoneNumber: '1234567890',
    password: 'test123',
    firstName: 'John',
    lastName: 'Agent',
    email: 'john.agent@test.com',
    submittedFormType: null, // null = no form, 'agent'|'borrower'|'lender' = submitted
    verified: false // true = verified, false = awaiting
    isAdmin: false // true = is an admin, false = not admin
    bypassValidation: true // just a test flag so can parse through each of the pages as admin without filling them out

  },
  // ... more users
]
```

## Changing Verification Status

To change a user's verification status:

1. Open `src/config/testUsers.ts`
2. Find the user you want to modify
3. Change `submittedFormType`:
   - `null` = No form submitted
   - `'agent'` = Agent form submitted
   - `'borrower'` = Borrower form submitted
   - `'lender'` = Lender form submitted
4. Change `verified`:
   - `false` = Awaiting verification
   - `true` = Verified
5. Save the file and login again with that user's credentials

## Notes

- All test users use the same password: `123`
- Signup is disabled - only test users can login
- Verification status is initialized on login based on test user config
- Changes to test users require a new login to take effect

