const express = require('express');
const path = require('path');
const cors = require("cors"); // allows requests from frontend (middleware)

const countryRouter = require('./routes/country');

const app = express()

app.use(cors({
  origin: "http://localhost:5173", // allow Vite dev server
  credentials: true               // if needed for cookies/auth
}));
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({extended:true})); // parse URL-encoded request bodies
app.use(express.static(path.join(__dirname,"public"))); // serve static files
app.use(express.static(path.join(__dirname, '../client/dist'))); // serve frontend build files

// Routes that are server API endpoints
app.use("/api/country", countryRouter);

// For all other routes, serve React's index.html (enables client-side routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000!`)
})