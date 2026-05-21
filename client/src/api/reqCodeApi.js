import apiClient from "./apiClient";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const sendMail = async (email) => {
  try {
    const res = await apiClient.post(`/codeRequest`, { email });
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};

export const verifyCode = async (email, userCode) => {
  try {
    const res = await apiClient.post(`/codeRequest/verifyCode`, { email, userCode }); 
    return res.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

export const resetPassword = async (email, newPassword, resetToken) => {
  try {
    const res = await apiClient.post(`/codeRequest/resetPassword/?token=${resetToken}`, { email, newPassword});
    return res.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
