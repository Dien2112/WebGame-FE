import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Supabase Project ID - thay thế bằng project ID thực của bạn
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'your-supabase-project-id';

// Supabase URL - có thể cấu hình qua environment variable
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;

// API Helper functions
export const api = {
  // Base URL cho API
  baseUrl: import.meta.env.VITE_API_URL || supabaseUrl,
  
  // Lấy token từ localStorage
  getToken: () => localStorage.getItem('token') || localStorage.getItem('accessToken'),
  
  // Headers mặc định
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${api.getToken()}`
  })
};
