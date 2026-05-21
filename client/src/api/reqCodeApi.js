import apiClient from "./apiClient";

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
