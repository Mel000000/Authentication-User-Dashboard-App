import apiClient from "./apiClient";

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