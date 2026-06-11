import axios from "axios";

export const getCountryNameList = async () => {
  try {
    const cached = localStorage.getItem("countries");
    if (cached) {
      return JSON.parse(cached); // Return parsed array
    }
    const response = await axios.get("https://geoapi.info/api/countries?limit=250");
    const countries = response.data.countries;
    localStorage.setItem("countries", JSON.stringify(countries));
    return localStorage.getItem("countries");
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};


export const getCountryLoc = async (value) => {
  try{
    if (value === "") {
      return null;
    }
    const response = await axios.get("https://geoapi.info/api/country?name=" + value);
    const centerLon = (response.data.coordinates.north + response.data.coordinates.south)/2;
    const centerLat = (response.data.coordinates.east + response.data.coordinates.west)/2;
    return{Lat:centerLat, Lon:centerLon};
  } catch (error) {
    console.error("Error fetching country data:", error);
    throw error;
  }
};