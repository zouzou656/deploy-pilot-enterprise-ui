
import { createApiUrl } from '@/config/api.config';
import useAuthStore from '@/stores/authStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: object;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Central API client for making HTTP requests
 */
class ApiClient {
  private getAuthToken(): string | null {
    const { token } = useAuthStore.getState();
    return token;
  }

  /**
   * Make an API request
   */
  async request<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      params,
      headers = {},
      requiresAuth = true
    } = options;

    try {
      // Create full URL with path parameters
      const url = createApiUrl(endpoint, params);
      
      // Set up request headers
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers
      };

      // Add auth token if required
      if (requiresAuth) {
        const token = this.getAuthToken();
        if (!token) {
          return {
            data: null,
            error: 'Authentication required',
            status: 401
          };
        }
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      // Make the request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined
      });

      // Handle different status codes
      if (response.status === 204) {
        // No content response
        return {
          data: null,
          error: null,
          status: response.status
        };
      }

      // Try to parse response as JSON
      let data: T | null = null;
      let error: string | null = null;

      if (response.headers.get('content-type')?.includes('application/json')) {
        const responseData = await response.json();
        if (response.ok) {
          data = responseData;
        } else {
          error = responseData.message || responseData.error || 'An unknown error occurred';
        }
      } else if (!response.ok) {
        error = `HTTP Error ${response.status}: ${response.statusText}`;
      }

      return {
        data,
        error,
        status: response.status
      };
    } catch (err) {
      console.error('API request failed:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Network error',
        status: 0
      };
    }
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body: object, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body: object, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(endpoint: string, options: Omit<ApiRequestOptions, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
