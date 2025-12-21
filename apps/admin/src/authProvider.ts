import { AuthProvider } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const TOKEN_KEY = 'admin-access-token';
const REFRESH_TOKEN_KEY = 'admin-refresh-token';

export const authProvider: AuthProvider = {
  login: async ({ email, name }: { email: string; name?: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/dev-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return Promise.resolve();
  },

  checkAuth: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? Promise.resolve() : Promise.reject();
  },

  checkError: (error: any) => {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject();
    }
    return Promise.resolve();
  },

  getIdentity: async () => {
    const token = getToken();
    if (!token) {
      return Promise.reject();
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get identity');
      }

      const user = await response.json();
      return Promise.resolve({
        id: user.id,
        fullName: user.name || user.email,
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },

  getPermissions: () => Promise.resolve('admin'),
};

