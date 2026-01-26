const BASE_URL = import.meta.env.VITE_API_URL;

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

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
