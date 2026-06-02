const express = require("express");
const axios = require("axios");
const router = express.Router();

// Return a simple array of country name strings. Place this route before ":value"
router.get("/all", async (req, res) => {
    try{
        const apiEndpointRes = await axios.get("https://restcountries.com/v3.1/all?fields=name");
        const names = apiEndpointRes.data.map(c => (c && c.name && c.name.common) ? c.name.common : null).filter(Boolean);
        res.send(names);
    } catch (error) {
        res.status(500).send("Error fetching country names list");
    }
});

// Return latitude and longitude for a given country name
router.get("/:value", async (req, res) => {
    try{
        req.params.value = decodeURIComponent(req.params.value);
        const apiEndpointRes = await axios.get("https://restcountries.com/v3.1/name/" + req.params.value);
        res.send(apiEndpointRes.data[0].latlng);
    } catch (error) {
        res.status(500).send("Error fetching country data");
    }
});

// Return flag URL for a given country name
router.get("/flag/:countryName", async (req, res) => {
    try {
        req.params.countryName = decodeURIComponent(req.params.countryName);
        const apiEndpointRes = await axios.get("https://restcountries.com/v3.1/name/" + req.params.countryName);
        const flagUrl = apiEndpointRes.data[0].flags && apiEndpointRes.data[0].flags.png ? apiEndpointRes.data[0].flags.png : null;
        res.send({ flagUrl });
    } catch (error) {
        res.status(500).send("Error fetching country flag");
    }
});

module.exports = router;