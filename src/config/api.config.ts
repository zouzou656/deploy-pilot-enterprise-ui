
/**
 * API Configuration
 * Central place for all API-related configuration
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:5020',
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
      ASSIGN_ROLE: '/api/auth/users/:id/roles/:roleId',
      REMOVE_ROLE: '/api/auth/users/:id/roles/:roleId',
      USER_PERMISSIONS: '/api/auth/permissions/user/:userId',
      ADD_PERMISSION: '/api/auth/permissions/user/:userId/:permId',
      REMOVE_PERMISSION: '/api/auth/permissions/user/:userId/:permId',
    },
    // Role management
    ROLES: {
      LIST: '/api/auth/roles',
      GET: '/api/auth/roles/:id',
      CREATE: '/api/auth/roles',
      UPDATE: '/api/auth/roles/:id',
      DELETE: '/api/auth/roles/:id',
      ROLE_PERMISSIONS: '/api/auth/permissions/role/:roleId',
      ADD_PERMISSION: '/api/auth/permissions/role/:roleId/:permId',
      REMOVE_PERMISSION: '/api/auth/permissions/role/:roleId/:permId',
    },
    // Permission management
    PERMISSIONS: {
      LIST: '/api/auth/permissions',
      GET: '/api/auth/permissions/:id',
      CREATE: '/api/auth/permissions',
      UPDATE: '/api/auth/permissions/:id',
      DELETE: '/api/auth/permissions/:id',
    },
    // Git operations
    GIT: {
      BRANCHES: '/api/git/branches',
      COMMITS: '/api/git/commits',
      COMMIT: '/api/git/commit',
      COMPARE: '/api/git/compare',
      FULL: '/api/git/full',
      TREE: '/api/git/tree',
      COMPARE_FILES: '/api/git/compare-files',
      FILE_CONTENT: '/api/git/file-content',
    },
    // Project management
    PROJECTS: {
      LIST: '/api/projects',
      GET: '/api/projects/:id',
      CREATE: '/api/projects',
      UPDATE: '/api/projects/:id',
      DELETE: '/api/projects/:id',
      USER_PROJECTS: '/api/projects/user/:userId',
      ASSIGN_USER: '/api/projects/:projectId/users/:userId',
      REMOVE_USER: '/api/projects/:projectId/users/:userId',
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
