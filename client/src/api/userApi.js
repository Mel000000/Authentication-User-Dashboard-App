import apiClient from "./apiClient";

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
    const res = await apiClient.post("/user/loginUser", loginData,{
      withCredentials: true, // Ensure cookies are sent with the request
    });
    localStorage.setItem("authToken", res.data.token); 
    return res.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    alert("Login failed. Please check your credentials and try again.");
    throw error;
  }
};


export const getCurrentUser = async () => {
  try {
    const res = await apiClient.get("/user/me",{
      withCredentials: true, // Ensure cookies are sent with the request
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}` // Include token in Authorization header
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await apiClient.post("/user/logout", {
      withCredentials: true, // Ensure cookies are sent with the request
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}` // Include token in Authorization header
      }
    });
    return res.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};