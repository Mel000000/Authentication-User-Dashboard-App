const express = require('express');
const path = require('path');
const cors = require("cors"); // allows requests from frontend (middleware)
require("dotenv").config(); // load .env

const countryRouter = require('./routes/country');
const codeRequestRouter = require('./routes/codeRequest');

const app = express()

app.use(cors({
  origin: "http://localhost:5173", // allow Vite dev server
  credentials: true               // if needed for cookies/auth
}));
// Content Security Policy (CSP)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com;
      frame-src https://www.google.com;
      worker-src https://www.google.com https://www.gstatic.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https://www.google.com https://www.gstatic.com;
      connect-src 'self' https://www.google.com;
    `.replace(/\s{2,}/g, ' ').trim()
  );
  next();
});

app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({extended:true})); // parse URL-encoded request bodies
app.use(express.static(path.join(__dirname,"public"))); // serve static files
app.use(express.static(path.join(__dirname, '../client/dist'))); // serve frontend build files

// Routes that are server API endpoints
app.use("/api/country", countryRouter);
app.use("/api/codeRequest", codeRequestRouter);

// For all other routes, serve React's index.html (enables client-side routing)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000!`)
})