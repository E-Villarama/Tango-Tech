# Testing Verification Banner

## Quick Test Setup

The verification banner is now set to `force-show="true"` in both `Dashboard.vue` and `AgentDashboardWrapper.vue` for testing purposes.

## How to Test

### 1. **See the Banner**
   - Log in as a verified user (check `testUsers.json` for users with `"verified": true`)
   - The banner should appear at the top of the dashboard

### 2. **Test Manual Close**
   - Click the X button in the top-right corner of the banner
   - The banner should disappear
   - Refresh the page - the banner should NOT reappear (it's stored in localStorage)

### 3. **Test Auto-Close**
   - Reset the banner state (see below)
   - Change `:auto-close-delay="0"` to `:auto-close-delay="5000"` (5 seconds) in `Dashboard.vue`
   - The banner should auto-close after 5 seconds

### 4. **Reset Banner State (to test again)**
   Open browser console (F12) and run:
   ```javascript
   // For agent dashboard
   localStorage.removeItem('verificationBannerClosed_agent')
   
   // For borrower dashboard
   localStorage.removeItem('verificationBannerClosed_borrower')
   
   // Or remove all banner states
   Object.keys(localStorage).filter(key => key.startsWith('verificationBannerClosed_')).forEach(key => localStorage.removeItem(key))
   ```
   Then refresh the page.

## Test Users

Check `src/data/testUsers.json`:
- Users with `"verified": true` will see the dashboard immediately
- Users with `"verified": false` will see the "Awaiting Verification" screen

## Current Settings

- **Dashboard.vue**: `:auto-close-delay="0"` (disabled) + `:force-show="true"` (always show)
- **AgentDashboardWrapper.vue**: Default delay (30 seconds) + `:force-show="true"` (always show)

## Remove Force Show (Production)

When ready for production, remove `:force-show="true"` from both components. The banner will then:
- Only show if not previously closed
- Respect the auto-close delay
- Persist closed state across page refreshes

