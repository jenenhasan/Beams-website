import { 
    AuthResponse, 
    User, 
    MenuResponse, 
    MenuData,
    LoginRequest,
    ApiError 
  } from './types';
  
const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : 'http://localhost:8000/api/v1';
  
  async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    console.log('📡 Fetching:', url, options);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  
    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as ApiError;
      console.error('❌ API Error:', response.status, error);
      throw new Error(error.detail || error.message || `API error: ${response.status}`);
    }
  
    const data = await response.json();
    console.log('✅ API Response:', data);
    return data;
  }
  
  // Menu API
  export const menuApi = {
    getMenu: (): Promise<MenuResponse> => {
      console.log('📡 Getting menu...');
      return fetchApi<MenuResponse>('/menu/');
    },
    
    updateMenu: (data: MenuData, token: string): Promise<{ message: string; data: MenuData }> => {
      console.log('📡 Updating menu with token:', token);
      return fetchApi<{ message: string; data: MenuData }>('/menu/', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    },
    
    resetMenu: (token: string): Promise<{ message: string }> =>
      fetchApi<{ message: string }>('/menu/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }),
  };
  
  // Auth API
  export const authApi = {
    login: (username: string, password: string): Promise<AuthResponse> => {
      console.log('📡 Logging in...');
      return fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password } as LoginRequest),
      });
    },
    
    getMe: (token: string): Promise<User> =>
      fetchApi<User>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }),
    
    setup: (): Promise<{ message: string }> =>
      fetchApi<{ message: string }>('/auth/setup', { method: 'POST' }),
  };