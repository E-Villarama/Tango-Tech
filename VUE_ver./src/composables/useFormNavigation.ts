// Form navigation composable for OnboardingForm
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
    const goToNextPage = () => {
        if (currentPage.value < totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
            currentPage.value++
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        } else if (!isCurrentPageValid.value && !bypassValidation.value) {
            errorMessage.value = 'Please complete all required fields on this page before continuing.'
        }
    }

    const goToPreviousPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        }
    }

    const goToReviewPage = () => {
        if (currentPage.value === totalPages.value && (isCurrentPageValid.value || bypassValidation.value)) {
            currentPage.value = totalPages.value + 1 // Review page
            window.scrollTo({ top: 0, behavior: 'smooth' })
            errorMessage.value = ''
        } else if (!isCurrentPageValid.value && !bypassValidation.value) {
            errorMessage.value = 'Please complete all required fields on this page before continuing.'
        }
    }

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

