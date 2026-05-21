import apiClient from "./apiClient";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const getCountryLoc = async (value) => {
  try {
    if (value === "") {
      return null;
    }
    const res = await apiClient.get(`/country/${value}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};

export const getCountryNameList = async () => {
  try {
    const res = await apiClient.get(`/country/all`);
    return res.data;
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};