import axios from "axios";

const apiClient = axios.create({
  //baseURL: "https://authentication-user-dashboard-app-backend.onrender.com/api", // Production backend URL
  baseURL: "http://localhost:3000/api", // Development backend URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Use an explicit, dynamic request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;