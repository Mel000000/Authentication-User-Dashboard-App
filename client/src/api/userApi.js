import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← This sends cookies with EVERY request
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createUser = async (userData) => {
  try {
    const res = await apiClient.post("/user/createUser", userData); 
    return res.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const loginUser = async (loginData) => {
  try {
    const res = await apiClient.post("/user/loginUser", loginData);
    window.location.href = "http://localhost:5173/home"; // Redirect to home page on successful login
    return res.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    alert("Login failed. Please check your credentials and try again.");
    throw error;
  }
};


export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get("/user/me");
    return res.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await apiClient.post("/user/logout");
    return res.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};