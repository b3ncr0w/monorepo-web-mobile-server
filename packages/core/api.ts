interface ApiResponse<T> {
  data?: T;
  error?: string;
}

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://192.168.0.185:3000'
  : 'http://192.168.0.185:3000';

export async function fetchApi<T>(
  endpoint: string, 
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { data: data as T };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Server unreachable' };
  }
} 