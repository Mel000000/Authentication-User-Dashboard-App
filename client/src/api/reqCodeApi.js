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
  } catch (error) {
    console.error("Error verifying code:", error);
    throw error;
  }
};