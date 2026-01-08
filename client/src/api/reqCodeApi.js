import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const sendMail = async (email) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/codeRequest`, { email });
    console.log("Mail sent response:", res.data);
  } catch (error) {
    console.error("Error sending mail:", error);
    throw error;
  }
};
