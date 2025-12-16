import { ref, reactive } from 'vue'
import type { LocationData } from '../types/monitoring'

export function useLocationCapture() {
    const locationStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
    const locationData = reactive<LocationData>({
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString()
    })

    const captureLocation = (): Promise<void> => {
        return new Promise((resolve, reject) => {
            locationStatus.value = 'loading'
            
            if (!navigator.geolocation) {
                locationStatus.value = 'error'
                reject(new Error('Geolocation is not supported by your browser.'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationData.latitude = position.coords.latitude
                    locationData.longitude = position.coords.longitude
                    locationData.accuracy = position.coords.accuracy
                    locationData.timestamp = new Date().toISOString()
                    locationStatus.value = 'success'
                    resolve()
                },
                (error) => {
                    locationStatus.value = 'error'
                    reject(error)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
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

