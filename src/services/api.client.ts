// src/services/api.client.ts

import { createApiUrl } from '@/config/api.config';
import useAuthStore from '@/stores/authStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: object;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
  responseType?: 'json' | 'text';   // ← NEW: allow requesting text
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
   * Make an API request, optionally as JSON or plain text.
   */
  async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      params,
      headers = {},
      requiresAuth = true,
      responseType = 'json',   // ← default to JSON
    } = options;

    try {
      // Build full URL (with query params)
      const url = createApiUrl(endpoint, params);

      // Prepare request headers
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers,
      };

      if (requiresAuth) {
        const token = this.getAuthToken();
        if (!token) {
          return {
            data: null,
            error: 'Authentication required',
            status: 401,
          };
        }
        requestHeaders.Authorization = `Bearer ${token}`;
      }

      // Send the request
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      // If 204 No Content, return immediately
      if (response.status === 204) {
        return {
          data: null,
          error: null,
          status: response.status,
        };
      }

      // If user asked for text, do response.text()
      if (responseType === 'text') {
        if (!response.ok) {
          return {
            data: null,
            error: `HTTP Error ${response.status}: ${response.statusText}`,
            status: response.status,
          };
        }
        const textData = (await response.text()) as unknown as T;
        return {
          data: textData,
          error: null,
          status: response.status,
        };
      }

      // Otherwise, responseType is 'json'
      // Only attempt JSON parse when content-type is JSON
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const jsonData = await response.json();
        if (response.ok) {
          return {
            data: jsonData as T,
            error: null,
            status: response.status,
          };
        } else {
          // Try to extract a message from JSON body
          const errMessage =
            (jsonData as any).message ||
            (jsonData as any).error ||
            `HTTP ${response.status}`;
          return {
            data: null,
            error: errMessage,
            status: response.status,
          };
        }
      }

      // If not JSON and not text, but we requested JSON, it's an error
      if (!response.ok) {
        return {
          data: null,
          error: `HTTP Error ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      // If we get here, response is non-JSON (e.g. XML) but user didn't ask for text front
      // Return null data with no error (or you could return raw text if you want)
      return {
        data: null,
        error: null,
        status: response.status,
      };
    } catch (err) {
      console.error('API request failed:', err);
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Network error',
        status: 0,
      };
    }
  }

  // Convenience methods:
  async get<T = any>(
    endpoint: string,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string,
    body: object,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  async put<T = any>(
    endpoint: string,
    body: object,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  async delete<T = any>(
    endpoint: string,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
