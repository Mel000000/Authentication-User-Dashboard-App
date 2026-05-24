import apiClient from "./apiClient";

// FIX: return the response so callers can detect errors
export const sendMail = async (email, mode = "reset") => {
  try {
    const res = await apiClient.post(`/codeRequest`, { email, mode });
    return res.data;
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};

export const verifyCode = async (email, userCode, mode = "reset") => {
  try {
    const res = await apiClient.post(`/codeRequest/verifyCode`, { email, userCode, mode });
    return res.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

export const resetPassword = async (email, newPassword, resetToken) => {
  try {
    const res = await apiClient.post(`/codeRequest/resetPassword/?token=${resetToken}`, { email, newPassword });
    return res.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};