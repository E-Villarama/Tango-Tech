/**
 * Global Location State Composable
 * 
 * Provides a shared, app-wide location state that persists across navigation.
 * This composable wraps the existing useLocationCapture functionality and
 * provides a centralized location store that can be accessed from any component.
 * 
 * Usage:
 * - Call initializeLocation() on app mount to capture initial location
 * - Call updateLocation() to refresh location data (e.g., in monitoring form)
 * - Access locationState for current location data and status
 * 
 * The location is stored in-memory and will be lost on page refresh.
 * This is intentional - we re-request permission on every app launch.
 */
import { reactive, readonly } from 'vue'
import type { LocationData } from '../types/monitoring'

interface GlobalLocationState {
    latitude: number
    longitude: number
    timestamp: string
    accuracy?: number
    status: 'idle' | 'loading' | 'success' | 'error'
    permissionStatus: 'prompt' | 'granted' | 'denied'
    lastError: GeolocationPositionError | null
}

// Shared global state - single source of truth for location data
const globalLocationState = reactive<GlobalLocationState>({
    latitude: 0,
    longitude: 0,
    timestamp: new Date().toISOString(),
    accuracy: undefined,
    status: 'idle',
    permissionStatus: 'prompt',
    lastError: null
})

/**
 * Get user-friendly error message based on error type
 */
const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location is not valid. Turn on Location access and retry. If failure persists, please contact admin for assistance.'
        case error.POSITION_UNAVAILABLE:
            return 'Location information is unavailable. Please check your device GPS settings.'
        case error.TIMEOUT:
            return 'Location request timed out. Please try again.'
        default:
            return 'An unknown error occurred while capturing location.'
    }
}

/**
 * Check current permission status for geolocation
 */
const checkPermissionStatus = async (): Promise<void> => {
    try {
        if ('permissions' in navigator) {
            const result = await navigator.permissions.query({ name: 'geolocation' })
            globalLocationState.permissionStatus = result.state as 'prompt' | 'granted' | 'denied'
            
            // Listen for permission changes
            result.addEventListener('change', () => {
                globalLocationState.permissionStatus = result.state as 'prompt' | 'granted' | 'denied'
            })
        }
    } catch (error) {
        console.warn('Permissions API not supported:', error)
    }
}

/**
 * Core location capture function
 * Requests location from browser and updates global state
 */
const captureLocationData = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        globalLocationState.status = 'loading'
        
        if (!navigator.geolocation) {
            globalLocationState.status = 'error'
            const error = new Error('Geolocation is not supported by your browser.')
            reject(error)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Update global state with new location
                globalLocationState.latitude = position.coords.latitude
                globalLocationState.longitude = position.coords.longitude
                globalLocationState.accuracy = position.coords.accuracy
                globalLocationState.timestamp = new Date().toISOString()
                globalLocationState.status = 'success'
                globalLocationState.permissionStatus = 'granted'
                globalLocationState.lastError = null
                resolve()
            },
            (error) => {
                globalLocationState.status = 'error'
                globalLocationState.lastError = error
                
                if (error.code === error.PERMISSION_DENIED) {
                    globalLocationState.permissionStatus = 'denied'
                }
                
                const errorMessage = getLocationErrorMessage(error)
                reject(new Error(errorMessage))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    })
}

/**
 * Composable export - provides global location functionality
 */
export function useGlobalLocation() {
    /**
     * Initialize location on app launch
     * Should be called from App.vue on mount
     */
    const initializeLocation = async (): Promise<void> => {
        await checkPermissionStatus()
        return captureLocationData()
    }

    /**
     * Update location data
     * Can be called from monitoring form or anywhere location refresh is needed
     */
    const updateLocation = async (): Promise<void> => {
        await checkPermissionStatus()
        return captureLocationData()
    }

    /**
     * Get current location data in the format expected by monitoring form
     */
    const getLocationData = (): LocationData => {
        return {
            latitude: globalLocationState.latitude,
            longitude: globalLocationState.longitude,
            timestamp: globalLocationState.timestamp,
            accuracy: globalLocationState.accuracy
        }
    }

    /**
     * Check if location has been successfully captured
     */
    const hasValidLocation = (): boolean => {
        return globalLocationState.status === 'success' && 
               globalLocationState.latitude !== 0 && 
               globalLocationState.longitude !== 0
    }

    return {
        // Readonly state - components can read but not directly mutate
        locationState: readonly(globalLocationState),
        
        // Methods
        initializeLocation,
        updateLocation,
        getLocationData,
        hasValidLocation,
        checkPermissionStatus,
        getLocationErrorMessage
    }
}
