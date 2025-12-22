/**
 * Location capture composable for MonitoringForm
 * 
 * Handles getting the user's GPS location using the browser's geolocation API.
 * This is used in the monitoring form to capture where agents are when they
 * submit site evaluations.
 * 
 * The location is stored with coordinates, accuracy, and timestamp. Status tracks
 * whether we're still loading, succeeded, or failed.
 */
import { ref, reactive } from 'vue'
import type { LocationData } from '../types/monitoring'

export function useLocationCapture() {
    // Tracks the current state of location capture
    const locationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
    
    // Stores the actual location data once captured
    const locationData = reactive<LocationData>({
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString()
    })

    /**
     * Captures the user's current location using browser geolocation
     * 
     * This uses the browser's built-in geolocation API. It requests high accuracy
     * and has a 10 second timeout. If the user denies permission or location isn't
     * available, it will reject with an error.
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
                reject(new Error('Geolocation is not supported by your browser.'))
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
                    resolve()
                },
                // Error callback - location capture failed
                (error) => {
                    locationStatus.value = 'error'
                    reject(error)
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

    return {
        locationStatus,
        locationData,
        captureLocation
    }
}

