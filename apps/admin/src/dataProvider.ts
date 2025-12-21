import { DataProvider } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'admin-access-token';
const REFRESH_TOKEN_KEY = 'admin-refresh-token';

const httpClient = async (url: string, options: any = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 - try refresh
  if (response.status === 401 && token && !options.headers?.['X-Retry']) {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem(TOKEN_KEY, data.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);

          // Retry original request
          headers.Authorization = `Bearer ${data.accessToken}`;
          response = await fetch(url, { ...options, headers: { ...headers, 'X-Retry': 'true' } });
        } else {
          // Refresh failed, clear tokens
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      } catch {
        // Refresh failed, clear tokens
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    }
  }

  return response;
};

export const dataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filter = params.filter || {};

    // Build query params
    const queryParams = new URLSearchParams();
    
    // Range for pagination
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    queryParams.set('range', JSON.stringify([start, end]));

    // Sort
    queryParams.set('sort', JSON.stringify({ field, order: order.toUpperCase() }));

    // Filter
    queryParams.set('filter', JSON.stringify(filter));

    const url = `${API_URL}/${resource}?${queryParams.toString()}`;
    const response = await httpClient(url);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch ${resource}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    
    // Parse Content-Range header
    const contentRange = response.headers.get('Content-Range');
    let total = data.length;
    
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        total = parseInt(match[1], 10);
      }
    }

    return {
      data,
      total,
    };
  },

  getOne: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    const response = await httpClient(url);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch ${resource}/${params.id}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return { data };
  },

  create: async (resource, params) => {
    const url = `${API_URL}/${resource}`;
    const response = await httpClient(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to create ${resource}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return { data };
  },

  update: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    const response = await httpClient(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params.data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to update ${resource}/${params.id}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return { data };
  },

  delete: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    const response = await httpClient(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to delete ${resource}/${params.id}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    return { data: params.previousData };
  },

  getMany: async (resource, params) => {
    const filter = { id: params.ids };
    const queryParams = new URLSearchParams();
    queryParams.set('filter', JSON.stringify(filter));

    const url = `${API_URL}/${resource}?${queryParams.toString()}`;
    const response = await httpClient(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }

    const data = await response.json();
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filter = {
      ...params.filter,
      [params.target]: params.id,
    };

    const queryParams = new URLSearchParams();
    const start = (page - 1) * perPage;
    const end = start + perPage - 1;
    queryParams.set('range', JSON.stringify([start, end]));
    queryParams.set('sort', JSON.stringify({ field, order: order.toUpperCase() }));
    queryParams.set('filter', JSON.stringify(filter));

    const url = `${API_URL}/${resource}?${queryParams.toString()}`;
    const response = await httpClient(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${resource}`);
    }

    const data = await response.json();
    const contentRange = response.headers.get('Content-Range');
    let total = data.length;
    
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)$/);
      if (match) {
        total = parseInt(match[1], 10);
      }
    }

    return {
      data,
      total,
    };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params.data),
      })
    );

    await Promise.all(promises);
    return { data: params.ids };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, {
        method: 'DELETE',
      })
    );

    await Promise.all(promises);
    return { data: params.ids };
  },
};

