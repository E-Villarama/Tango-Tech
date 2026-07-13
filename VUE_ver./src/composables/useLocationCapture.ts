/**
 * Location capture composable for MonitoringForm
 * 
 * Handles getting the user's GPS location using the browser's geolocation API.
 * This is used in the monitoring form to capture where agents are when they
 * submit site evaluations.
 * 
 * The location is stored with coordinates, accuracy, and timestamp. Status tracks
 * whether we're still loading, succeeded, or failed.
 * 
 * Enhanced with permission tracking and detailed error handling for better UX.
 */
import { ref, reactive } from 'vue'
import type { LocationData } from '../types/monitoring'

export function useLocationCapture() {
    // Tracks the current state of location capture
    const locationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
    
    // Tracks the permission state
    const permissionStatus = ref<'prompt' | 'granted' | 'denied'>('prompt')
    
    // Stores the last error that occurred
    const lastError = ref<GeolocationPositionError | null>(null)
    
    // Stores the actual location data once captured
    const locationData = reactive<LocationData>({
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString()
    })

    /**
     * Check current permission status for geolocation
     * 
     * Uses the Permissions API to check if location permission has been granted,
     * denied, or is still waiting for user response.
     */
    const checkPermissionStatus = async (): Promise<void> => {
        try {
            if ('permissions' in navigator) {
                const result = await navigator.permissions.query({ name: 'geolocation' })
                permissionStatus.value = result.state as 'prompt' | 'granted' | 'denied'
            }
        } catch (error) {
            // Permissions API not supported in all browsers (e.g., older Safari)
            console.warn('Permissions API not supported:', error)
        }
    }

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
     * Captures the user's current location using browser geolocation
     * 
     * This uses the browser's built-in geolocation API. It requests high accuracy
     * and has a 10 second timeout. If the user denies permission or location isn't
     * available, it will reject with an error.
     * 
     * Enhanced with permission tracking and detailed error handling.
     * 
     * To modify the location settings (timeout, accuracy, etc.), edit the options
     * object passed to getCurrentPosition below.
     * 
     * @returns Promise that resolves when location is captured, rejects on error
     */
    const captureLocation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            locationStatus.value = 'loading'
            
            // Check if browser supports geolocation
            if (!navigator.geolocation) {
                locationStatus.value = 'error'
                const error = new Error('Geolocation is not supported by your browser.')
                reject(error)
                return
            }

            // Request location from browser
            navigator.geolocation.getCurrentPosition(
                // Success callback - location was captured
                (position) => {
                    locationData.latitude = position.coords.latitude
                    locationData.longitude = position.coords.longitude
                    locationData.accuracy = position.coords.accuracy
                    locationData.timestamp = new Date().toISOString()
                    locationStatus.value = 'success'
                    permissionStatus.value = 'granted'
                    lastError.value = null
                    resolve()
                },
                // Error callback - location capture failed
                (error) => {
                    locationStatus.value = 'error'
                    lastError.value = error
                    
                    // Update permission status based on error type
                    if (error.code === error.PERMISSION_DENIED) {
                        permissionStatus.value = 'denied'
                    }
                    
                    // Reject with user-friendly error message
                    const errorMessage = getLocationErrorMessage(error)
                    reject(new Error(errorMessage))
                },
                // Options for location request
                {
                    enableHighAccuracy: true, // Try to get most accurate location
                    timeout: 10000, // Give up after 10 seconds
                    maximumAge: 0 // Don't use cached location, always get fresh one
                }
            )
        })
    }

    /**
     * Retry location capture (useful when user changes permission)
     * 
     * This is the same as captureLocation but can be called after permission
     * has been changed. It will re-request location from the browser.
     */
    const retryLocationCapture = async (): Promise<void> => {
        // Check permission status first
        await checkPermissionStatus()
        
        // Attempt to capture location
        return captureLocation()
    }

    return {
        locationStatus,
        locationData,
        permissionStatus,
        lastError,
        captureLocation,
        retryLocationCapture,
        checkPermissionStatus,
        getLocationErrorMessage
    }
}

