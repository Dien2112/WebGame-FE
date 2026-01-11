const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Universal API Client for the application.
 * Automatically handles:
 * - Base URL prepending
 * - Authorization Header (Bearer token)
 * - Content-Type: application/json
 */
export const api = {
  get: async (endpoint) => request(endpoint, 'GET'),
  post: async (endpoint, body) => request(endpoint, 'POST', body),
  put: async (endpoint, body) => request(endpoint, 'PUT', body),
  delete: async (endpoint) => request(endpoint, 'DELETE'),
};

async function request(endpoint, method, body = null) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Ensure endpoint starts with / if not provided
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    
    // Handle 401 Unauthorized (Token expired/invalid) - Optional: Dispatch logout event
    if (response.status === 401) {
      // You could handle auto-logout here if accessing a protected resource
      // window.location.href = '/login'; 
      // But usually better to let the calling component/context decide or use an event bus.
    }

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
