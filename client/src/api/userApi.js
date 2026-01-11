import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const createUser = async (userData) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/user/createUser`, userData); 
    return res.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};