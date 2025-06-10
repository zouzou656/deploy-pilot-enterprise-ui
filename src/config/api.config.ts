// API Configuration

// Base API URL
export const API_BASE_URL = 'http://localhost:5020';

// API Endpoints
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh',
      VERIFY: '/api/auth/verify',
      RESET_PASSWORD: '/api/auth/reset-password',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
    },
    USERS: {
      LIST: '/api/auth/users',
      GET: '/api/auth/users/{id}',
      CREATE: '/api/auth/users',
      UPDATE: '/api/auth/users/{id}',
      DELETE: '/api/auth/users/{id}',
      ASSIGN_ROLE: '/api/auth/users/{id}/roles/{roleId}',
      REMOVE_ROLE: '/api/auth/users/{id}/roles/{roleId}',
    },
    ROLES: {
      LIST: '/api/auth/roles',
      GET: '/api/auth/roles/{id}',
      CREATE: '/api/auth/roles',
      UPDATE: '/api/auth/roles/{id}',
      DELETE: '/api/auth/roles/{id}',
    },
    PERMISSIONS: {
      LIST: '/api/auth/permissions',
      GET: '/api/auth/permissions/{id}',
      CREATE: '/api/auth/permissions',
      UPDATE: '/api/auth/permissions/{id}',
      DELETE: '/api/auth/permissions/{id}',
      GET_BY_ROLE: '/api/auth/permissions/role/{roleId}',
      ASSIGN_TO_ROLE: '/api/auth/permissions/role/{roleId}/{permId}',
      REMOVE_FROM_ROLE: '/api/auth/permissions/role/{roleId}/{permId}',
      GET_BY_USER: '/api/auth/permissions/user/{userId}',
      ASSIGN_TO_USER: '/api/auth/permissions/user/{userId}/{permId}',
      REMOVE_FROM_USER: '/api/auth/permissions/user/{userId}/{permId}',
    },
    PROJECTS: {
      LIST: '/api/projects',
      GET: '/api/projects/{id}',
      CREATE: '/api/projects',
      UPDATE: '/api/projects/{id}',
      DELETE: '/api/projects/{id}',
      USER_PROJECTS: '/api/projects/user/{userId}',
      ASSIGN_USER: '/api/projects/{projectId}/users/{userId}',
      REMOVE_USER: '/api/projects/{projectId}/users/{userId}',
    },
    ENVIRONMENTS: {
      LIST: '/api/environments',
      GET: '/api/environments/{id}',
      CREATE: '/api/environments',
      UPDATE: '/api/environments/{id}',
      DELETE: '/api/environments/{id}',
      BY_PROJECT: '/api/projects/{projectId}/environments',
      BY_USER: '/api/environments/user/{userId}',
      ASSIGN_USER: '/api/environments/{environmentId}/users/{userId}',
      REMOVE_USER: '/api/environments/{environmentId}/users/{userId}',
    },
    FILE_OVERRIDES: {
      BY_ENVIRONMENT: '/api/environments/{environmentId}/file-overrides',
      CREATE: '/api/environments/{environmentId}/file-overrides',
      UPDATE: '/api/file-overrides/{id}',
      DELETE: '/api/file-overrides/{id}',
    },
    GIT: {
      BRANCHES: '/api/git/branches',
      COMMITS: '/api/git/commits',
      COMMIT_DETAIL: '/api/git/commit/{sha}',
      COMPARE: '/api/git/compare',
      FULL_TREE: '/api/git/full',
      TREE: '/api/git/tree',
      COMPARE_FILES: '/api/git/compare-files',
      FILE_CONTENT: '/api/git/file-content',
    },
    CONFIG: {
      FILES: '/api/config/files',
    },
  },
};

/**
 * Creates a full API URL with path parameters replaced
 */
export function createApiUrl(
  endpoint: string,
  pathParams: Record<string, string> = {},
  queryParams: Record<string, string> = {}
): string {
  // Replace path parameters
  let url = API_BASE_URL + endpoint;
  Object.entries(pathParams).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  });

  // Add query parameters
  if (Object.keys(queryParams).length > 0) {
    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join('&');
    url += `?${queryString}`;
  }

  return url;
}
