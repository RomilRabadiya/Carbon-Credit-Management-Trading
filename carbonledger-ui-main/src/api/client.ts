import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8080") + "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

import { supabase } from "@/lib/supabase";

// Request interceptor (Optional: Logging or adding other headers)
apiClient.interceptors.request.use(
  async (config) => {
    // Add Authorization header from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and data unwrapping
apiClient.interceptors.response.use(
  (response) => {
    // Check if the response is wrapped in a ResponseEnvelope
    if (response.data && typeof response.data === 'object' && 'data' in response.data && 'status' in response.data) {
      // It's a ResponseEnvelope, unwrap it
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      // Don't hard redirect, let the app handle the auth state change
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
