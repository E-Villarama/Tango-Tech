/**
 * Form storage service
 * 
 * Handles saving and loading form progress using localStorage. This allows users to
 * save their progress and come back later to finish filling out forms.
 * 
 * IMPORTANT: Files cannot be stored in localStorage (it's too small and not meant for binary data).
 * We only save file metadata (name, size, type). Users will need to re-upload files when
 * they continue their saved form. If you need to save actual files, consider using IndexedDB
 * or just wait until the backend API is ready.
 * 
 * When the backend is ready, you can replace all localStorage calls with API calls.
 * See the TODO comment at the bottom for an example of how to do that.
 */
import type { OnboardingFormData } from '../types/onboarding'
import type { FormType } from '../types/formTypes'

export interface SavedFormData {
  formType: FormType
  formData: OnboardingFormData
  documentMetadata: Record<string, Array<{
    name: string
    size: number
    type: string
  }>>
  currentPage?: number // Current page number for multi-page forms
  savedAt: string
  lastModified: string
}

// Prefix for localStorage keys to avoid conflicts with other apps
const STORAGE_PREFIX = 'tango_saved_form_'

export const formStorage = {
  /**
   * Save form progress to localStorage
   * 
   * Saves the current form data, document metadata, and current page number.
   * Also stores timestamps for when it was saved and last modified.
   * 
   * Note: Files themselves are NOT saved - only metadata. Users will need to
   * re-upload files when continuing a saved form.
   * 
   * @param formType - Type of form (agent, borrower, etc.)
   * @param formData - The actual form field values
   * @param documentMetadata - File metadata (name, size, type) for each document field
   * @param currentPage - Current page number (for multi-page forms)
   */
  saveForm(formType: FormType, formData: OnboardingFormData, documentMetadata: Record<string, Array<{ name: string; size: number; type: string }>>, currentPage?: number): void {
    const savedData: SavedFormData = {
      formType,
      formData: { ...formData }, // Copy to avoid mutating original
      documentMetadata: { ...documentMetadata }, // Copy to avoid mutating original
      currentPage: currentPage || 1,
      savedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
    
    const key = `${STORAGE_PREFIX}${formType}`
    localStorage.setItem(key, JSON.stringify(savedData))
  },

  /**
   * Get saved form data for a specific form type
   * 
   * Retrieves the saved form from localStorage and parses it. Returns null if
   * no saved form exists or if there's an error parsing the data.
   * 
   * @param formType - Type of form to retrieve
   * @returns Saved form data or null if not found/error
   */
  getSavedForm(formType: FormType): SavedFormData | null {
    const key = `${STORAGE_PREFIX}${formType}`
    const saved = localStorage.getItem(key)
    
    if (!saved) {
      return null
    }
    
    try {
      return JSON.parse(saved) as SavedFormData
    } catch (error) {
      // If localStorage data is corrupted, log error and return null
      console.error('Error parsing saved form data:', error)
      return null
    }
  },

  /**
   * Check if a saved form exists for a form type
   * 
   * Quick check to see if there's saved progress without actually loading it.
   * 
   * @param formType - Type of form to check
   * @returns true if saved form exists, false otherwise
   */
  hasSavedForm(formType: FormType): boolean {
    return this.getSavedForm(formType) !== null
  },

  /**
   * Delete saved form for a specific form type
   * 
   * Removes the saved form from localStorage. Usually called after successful
   * form submission or when user explicitly wants to clear saved progress.
   * 
   * @param formType - Type of form to delete
   */
  deleteSavedForm(formType: FormType): void {
    const key = `${STORAGE_PREFIX}${formType}`
    localStorage.removeItem(key)
  },

  /**
   * Update last modified timestamp
   * 
   * Updates just the lastModified timestamp without changing the form data.
   * Useful if you want to track when a form was last edited.
   * 
   * @param formType - Type of form to update
   */
  updateLastModified(formType: FormType): void {
    const saved = this.getSavedForm(formType)
    if (saved) {
      saved.lastModified = new Date().toISOString()
      const key = `${STORAGE_PREFIX}${formType}`
      localStorage.setItem(key, JSON.stringify(saved))
    }
  },

  /**
   * Get all saved forms (for debugging/admin purposes)
   * 
   * Returns all saved forms for the currently enabled form types.
   * Currently only returns agent and borrower forms - other types are
   * commented out until they're needed.
   * 
   * To enable more form types, uncomment them in the formTypes array below.
   * 
   * @returns Object with form types as keys and saved form data as values
   */
  getAllSavedForms(): Record<string, SavedFormData> {
    const forms: Record<string, SavedFormData> = {}
    // Only return forms for types that are currently enabled
    const formTypes: FormType[] = ['agent', 'borrower'] // , 'lender', 'supervisor', 'partner', 'admin'
    
    formTypes.forEach(type => {
      const saved = this.getSavedForm(type)
      if (saved) {
        forms[type] = saved
      }
    })
    
    return forms
  }
}

// TODO: When backend is ready, replace localStorage calls with API calls:
// Example:
// export const formStorage = {
//   async saveForm(...) {
//     await fetch('/api/forms/save', { method: 'POST', body: JSON.stringify(...) })
//   },
//   async getSavedForm(...) {
//     const response = await fetch(`/api/forms/saved/${formType}`)
//     return await response.json()
//   },
//   ...
// }

// TODO: When backend is ready, replace localStorage calls with API calls:
// Example:
// export const formStorage = {
//   async saveForm(...) {
//     await fetch('/api/forms/save', { method: 'POST', body: JSON.stringify(...) })
//   },
//   async getSavedForm(...) {
//     const response = await fetch(`/api/forms/saved/${formType}`)
//     return await response.json()
//   },
//   ...
// }

