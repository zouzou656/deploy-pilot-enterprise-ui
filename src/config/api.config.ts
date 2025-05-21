
/**
 * API Configuration
 * Central place for all API-related configuration
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5050',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
    },
    // User management
    USERS: {
      LIST: '/api/auth/users',
      GET: '/api/auth/users/:id',
      CREATE: '/api/auth/users',
      UPDATE: '/api/auth/users/:id',
      DELETE: '/api/auth/users/:id',
      ASSIGN_PROJECT: '/api/auth/users/:id/projects',
      REMOVE_PROJECT: '/api/auth/users/:id/projects/:projectId',
    },
    // Role management
    ROLES: {
      LIST: '/api/auth/roles',
      GET: '/api/auth/roles/:id',
      CREATE: '/api/auth/roles',
      UPDATE: '/api/auth/roles/:id',
      DELETE: '/api/auth/roles/:id',
    },
    // Project management
    PROJECTS: {
      LIST: '/api/projects',
      GET: '/api/projects/:id',
      CREATE: '/api/projects',
      UPDATE: '/api/projects/:id',
      DELETE: '/api/projects/:id',
      USER_PROJECTS: '/api/projects/user',
    },
    // Environment management
    ENVIRONMENTS: {
      LIST: '/api/projects/:projectId/environments',
      GET: '/api/environments/:id',
      CREATE: '/api/projects/:projectId/environments',
      UPDATE: '/api/environments/:id',
      DELETE: '/api/environments/:id',
    },
    // File overrides
    OVERRIDES: {
      LIST: '/api/environments/:environmentId/overrides',
      GET: '/api/overrides/:id',
      CREATE: '/api/environments/:environmentId/overrides',
      UPDATE: '/api/overrides/:id',
      DELETE: '/api/overrides/:id',
    },
    // JAR generation
    JAR: {
      GENERATE: '/api/jar/generate',
      STATUS: '/api/jar/:id/status',
      LIST: '/api/jar',
    }
  },
};

/**
 * Helper to create full API URLs
 */
export const createApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  
  return url;
};
