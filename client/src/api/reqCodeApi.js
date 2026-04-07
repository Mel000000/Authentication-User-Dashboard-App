import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const sendMail = async (email) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/codeRequest`, { email });
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};

export const verifyCode = async (email, userCode) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/codeRequest/verifyCode`, { email, userCode }); 
    return res.data;
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};

export const resetPassword = async (email, newPassword) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/codeRequest/resetPassword`, { email, newPassword });
    return res.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};
