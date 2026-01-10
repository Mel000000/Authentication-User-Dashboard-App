import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";

export const getCountryLoc = async (value) => {
  try {
    if (value === "noCountry") {
      return null;
    }
    const res = await axios.get(`${API_BASE_URL}/country/${value}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};

export const getCountryNameList = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/country/all`);
    return res.data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};