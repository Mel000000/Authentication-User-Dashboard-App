import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_BASE_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: "https://authentication-user-dashboard-app-backend.onrender.com/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;