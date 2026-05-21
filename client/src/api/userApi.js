import apiClient from "./apiClient";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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