/**
 * Form navigation composable for OnboardingForm
 * 
 * Handles all the page navigation logic - going forward, backward, to review page, etc.
 * It also checks if the current page is valid before allowing navigation (unless admin bypass is on).
 * 
 * To modify navigation behavior, edit the functions below. For example, if you want to change
 * the error message when someone tries to skip ahead, edit goToNextPage().
 */
import { ref, type Ref } from 'vue'

interface UseFormNavigationOptions {
    currentPage: Ref<number>
    totalPages: Ref<number>
    isCurrentPageValid: Ref<boolean>
    bypassValidation: Ref<boolean>
    errorMessage: Ref<string>
}

export function useFormNavigation({
    currentPage,
    totalPages,
    isCurrentPageValid,
    bypassValidation,
    errorMessage
}: UseFormNavigationOptions) {
    /**
     * Moves to the next page if validation passes
     * 
     * Checks if the current page is valid before moving forward. If not valid and not admin,
     * it shows an error message. Also scrolls to top of page for better UX.
     */
    const goToNextPage = () => {
        // Only allow going forward if we're not on the last page AND the page is valid (or admin bypass)
        if (currentPage.value < totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
            currentPage.value++
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        } else if (!isCurrentPageValid.value && !bypassValidation.value) {
            // Show error if they try to skip ahead without filling required fields
            errorMessage.value = 'Please complete all required fields on this page before continuing.'
        }
    }

    /**
     * Moves to the previous page
     * 
     * No validation needed here - users should always be able to go back to fix things.
     */
    const goToPreviousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        }
    }

    /**
     * Goes to the review page (the last page where users can review before submitting)
     * 
     * The review page is always totalPages + 1. Only allows going there if on the last
     * form page and validation passes (or admin bypass).
     */
    const goToReviewPage = () => {
        // Review page is always one page after the last form page
        if (currentPage.value === totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
            currentPage.value = totalPages.value + 1 // Review page
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        } else if (!isCurrentPageValid.value && !bypassValidation.value) {
            errorMessage.value = 'Please complete all required fields on this page before continuing.'
        }
    }

    /**
     * Jumps to a specific page (used when editing from review page)
     * 
     * This is called when someone clicks "Edit" on the review page to go back
     * and fix something on a specific page.
     */
    const editSection = (pageNumber: number) => {
        currentPage.value = pageNumber
        window.scrollTo({ top: 0, behavior: 'smooth' })
        errorMessage.value = ''
    }

    return {
        goToNextPage,
        goToPreviousPage,
        goToReviewPage,
        editSection
    }
}

