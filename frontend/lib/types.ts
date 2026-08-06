export interface MenuItem {
    id: string;
    name: string;
    desc: string;
    price: string;
    favorite?: boolean;
    image?: string;  // ← Added this
  }
  
  export interface Category {
    id: string;
    numeral: string;
    title: string;
    subtitle: string;
    items: MenuItem[];
  }
  
  export interface MenuData {
    categories: Category[];
  }
  
  export interface MenuResponse {
    data: MenuData;
    updated_at?: string;
  }
  
  export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
  }
  
  export interface AuthResponse {
    access_token: string;
    token_type: string;
  }
  
  export interface User {
    id: number;
    username: string;
  }
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface ApiError {
    detail?: string;
    message?: string;
  }