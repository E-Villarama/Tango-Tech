/**
 * Centralized API Client
 * 
 * Provides a consistent interface for all API calls throughout the app. Handles
 * error handling, timeouts, JSON parsing, and logging automatically.
 * 
 * All API functions use this underlying apiRequest function, so if you need to
 * modify how requests work (like adding auth headers), you only need to change
 * it in one place.
 * 
 * To modify API behavior (timeout, base URL, headers, etc.), check the api.ts
 * config file and the apiRequest function below.
 */
import { API_CONFIG, getApiUrl } from '../config/api'

export interface ApiError {
  message: string
  status?: number
  statusText?: string
  data?: any
}

/**
 * Custom error class for API errors
 * 
 * Extends the standard Error class to include HTTP status information.
 * This makes it easier to handle different types of errors (404, 500, etc.)
 * in the components that use the API.
 */
export class ApiClientError extends Error {
  status?: number
  statusText?: string
  data?: any

  constructor(message: string, status?: number, statusText?: string, data?: any) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.statusText = statusText
    this.data = data
  }
}

/**
 * Centralized fetch wrapper with error handling
 * 
 * This is the core function that all API calls use. It:
 * - Builds the full URL from endpoint
 * - Sets default headers (Content-Type: application/json)
 * - Handles request timeouts (aborts after timeout period)
 * - Parses JSON responses
 * - Handles errors consistently
 * - Logs all requests/responses for debugging
 * 
 * To modify how requests work (add auth headers, change timeout, etc.),
 * edit this function. All API calls will automatically use the changes.
 * 
 * @param endpoint - API endpoint path (e.g., '/api/users')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with the response data
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint)
  
  // Default headers - can be overridden in options
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers, // User headers override defaults
    },
  }

  try {
    // Log request for debugging (only in dev)
    console.log(`📡 [API] ${options.method || 'GET'} ${url}`, options.body ? { body: options.body } : '')
    
    // Set up timeout - request will abort if it takes too long
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal, // Used for timeout
    })
    
    clearTimeout(timeoutId)
    
    console.log(`📡 [API] Response: ${response.status} ${response.statusText}`)
    
    // Check if response is JSON or plain text
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    // Handle error responses
    if (!response.ok) {
      let errorData: any = null
      try {
        // Try to parse error response as JSON, fall back to text
        errorData = isJson ? await response.json() : await response.text()
      } catch {
        // If parsing fails, use status text
        errorData = response.statusText
      }
      
      console.error(`❌ [API] Error response:`, errorData)
      throw new ApiClientError(
        errorData?.error || errorData?.message || `API request failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      )
    }
    
    // Parse successful response
    if (isJson) {
      const data = await response.json()
      console.log(`✅ [API] Success:`, data)
      return data as T
    } else {
      // Handle non-JSON responses (like plain text or HTML)
      const text = await response.text()
      return text as unknown as T
    }
  } catch (error) {
    // Re-throw our custom API errors as-is
    if (error instanceof ApiClientError) {
      throw error
    }
    
    // Handle network errors and timeouts
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiClientError('Request timeout', 408, 'Request Timeout')
      }
      console.error(`❌ [API] Network error:`, error)
      throw new ApiClientError(`Network error: ${error.message}`)
    }
    
    // Fallback for unknown errors
    throw new ApiClientError('Unknown error occurred')
  }
}

/**
 * GET request
 * 
 * Simple GET request - no body needed. Use for fetching data.
 * 
 * @param endpoint - API endpoint path
 * @returns Promise with response data
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' })
}

/**
 * POST request
 * 
 * POST request with JSON body. Use for creating new resources or submitting data.
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPost<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT request
 * 
 * PUT request with JSON body. Use for updating/replacing entire resources.
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPut<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PATCH request
 * 
 * PATCH request with JSON body. Use for partial updates to resources.
 * 
 * @param endpoint - API endpoint path
 * @param data - Data to send in request body (will be JSON stringified)
 * @returns Promise with response data
 */
export async function apiPatch<T>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE request
 * 
 * DELETE request - no body needed. Use for deleting resources.
 * 
 * @param endpoint - API endpoint path
 * @returns Promise with response data
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' })
}

/**
 * Upload file(s) using FormData
 * 
 * Special function for file uploads. Uses FormData instead of JSON, and doesn't
 * set Content-Type header (browser sets it automatically with the boundary).
 * 
 * This is separate from apiPost because file uploads need multipart/form-data,
 * not application/json.
 * 
 * @param endpoint - API endpoint path for upload
 * @param formData - FormData object containing files and other form fields
 * @returns Promise with response data
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const url = getApiUrl(endpoint)
  
  try {
    console.log(`📡 [API] POST (multipart) ${url}`)
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it automatically with boundary
    })
    
    console.log(`📡 [API] Response: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new ApiClientError(
        errorData?.error || `Upload failed: ${response.statusText}`,
        response.status,
        response.statusText,
        errorData
      )
    }
    
    const data = await response.json()
    console.log(`✅ [API] Upload success:`, data)
    return data as T
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }
    console.error(`❌ [API] Upload error:`, error)
    throw new ApiClientError(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

