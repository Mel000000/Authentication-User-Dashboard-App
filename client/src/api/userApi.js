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
    const res = await apiClient.post("/user/loginUser", loginData);
    return res.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const getCurrentUser = async (explicitToken=null) => {
  try {
    const config = {};
    if (explicitToken) {
      config.headers = {
        Authorization: `Bearer ${explicitToken}`
      };
    }
    const res = await apiClient.get("/user/me", config);
    return res.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await apiClient.post("/user/logout", {});
    localStorage.removeItem("authToken");
    return res.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const deleteUserAccount = async (email) => {
  try {
    const res = await apiClient.delete("/user/delete", { data: { email } });
    return res.data;
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const res = await apiClient.put("/user/updateProfile", profileData);
    return res.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// separate API call for editing the profile image, since it requires multipart/form-data
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    const res = await apiClient.post('/profile/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

export const storeRegistrationData = async (data) => {
  try{
    const res = await apiClient.post("/user/storeRegistrationData", data);
    return res.data;
  }catch(error){
    console.error("Error storing registration data:", error);
    throw error;
  }
};