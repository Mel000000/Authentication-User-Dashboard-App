import axios from "axios";

const apiClient = axios.create({
  // baseURL: "https://authentication-user-dashboard-app-backend.onrender.com/api", // Production backend URL
  baseURL: import.meta.env.VITE_API_URL  || "http://localhost:3000/api", // Development backend URL
  withCredentials: true,
  headers: {'Content-Type': 'application/json',},
});

let csrfToken = null;
let tokenExpiry = 0;

export const fetchCsrfToken = async (force = false) => {
  const now = Date.now();
  if (!force && csrfToken && now < tokenExpiry) return csrfToken;

  const response = await apiClient.get("/user/csrf-token");
  csrfToken = response.data.csrfToken;
  tokenExpiry = now + 4 * 60 * 1000;
  return csrfToken;
};

// Response interceptor — bust cache and retry once on CSRF failure
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const isCsrfError = status === 403 && !error.config._csrfRetry;

    if (isCsrfError) {
      error.config._csrfRetry = true;
      const fresh = await fetchCsrfToken(true); // force refresh
      error.config.headers["x-csrf-token"] = fresh;
      return apiClient(error.config);
    }
    return Promise.reject(error);
  }
);

export default apiClient;