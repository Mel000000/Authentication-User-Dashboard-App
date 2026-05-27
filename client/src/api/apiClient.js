import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://authentication-user-dashboard-app-backend.onrender.com/api", // Production backend URL
  // baseURL: "http://localhost:3000/api", // Development backend URL
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default apiClient;