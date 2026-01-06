const express = require("express");
const axios = require("axios");
const router = express.Router();

// Return a simple array of country name strings. Place this route before ":value"
// so "/all" isn't captured by the dynamic route.
router.get("/all", async (req, res) => {
    try{
        const apiEndpointRes = await axios.get("https://restcountries.com/v3.1/all?fields=name");
        const names = apiEndpointRes.data.map(c => (c && c.name && c.name.common) ? c.name.common : null).filter(Boolean);
        res.send(names);
    } catch (error) {
        res.status(500).send("Error fetching country names list");
    }
});

router.get("/:value", async (req, res) => {
    try{
        const apiEndpointRes = await axios.get("https://restcountries.com/v3.1/name/" + req.params.value);
        res.send(apiEndpointRes.data[0].latlng);
    } catch (error) {
        res.status(500).send("Error fetching country data");
    }
});

module.exports = router;