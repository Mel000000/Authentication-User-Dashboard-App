const express = require('express');
const path = require('path');
const mongoose = require("mongoose"); // MongoDB object modeling tool
const cors = require("cors"); // allows requests from frontend (middleware)
const cookieParser = require('cookie-parser');
const countryRouter = require('./routes/country');
const codeRequestRouter = require('./routes/codeRequest');
const userRouter = require('./routes/user');
const profileImageRouter = require('./routes/profileImage');
const { generalLimiter, authLimiter, emailLimiter } = require('./middleware/rateLimiter');
require("dotenv").config(); // load .env

const uri = process.env.MONGODB_URI;
const viteApiBaseUrl = process.env.VITE_API_BASE_URL;
const PORT = process.env.PORT || 3000;

async function connectDB() {
  try {
    await mongoose.connect(uri, {dbName: "Authentication-User-Dashboard-App"  });
    console.log("Successfully connected to MongoDB via Mongoose!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Stop the server if database connection fails
  }
}

connectDB();

const app = express()

app.use(cookieParser());

//const allowedOrigin = viteApiBaseUrl // Adjust this to match your frontend URL in development and production
const allowedOrigin = "http://localhost:5173"; // Adjust this to match your frontend URL in development and production

app.use(cors({
  origin: allowedOrigin, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({extended:true})); // parse URL-encoded request bodies

// Apply rate limiters only in production to avoid hindering development and testing
if (process.env.NODE_ENV === 'production') {
  app.use("/api/",generalLimiter);

  app.use('/api/codeRequest', emailLimiter);                // limits POST to /codeRequest
  app.use('/api/codeRequest/verifyCode', authLimiter);      // limits POST /verifyCode
  app.use('/api/user/loginUser', authLimiter);              // limits POST login
  app.use('/api/user/createUser', authLimiter);             // limits POST createUser

}



// Routes that are server API endpoints
app.use("/api/country", countryRouter);
app.use("/api/codeRequest", codeRequestRouter);
app.use("/api/user", userRouter);
app.use("/api/profile", profileImageRouter);



app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});