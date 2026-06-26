const express = require('express');
const path = require('path');
const mongoose = require("mongoose"); // MongoDB object modeling tool
const cors = require("cors"); // allows requests from frontend (middleware)
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // helps secure Express apps by setting various HTTP headers
const codeRequestRouter = require('./routes/codeRequest');
const userRouter = require('./routes/user');
const profileImageRouter = require('./routes/profileImage');
const {authLimiter, emailLimiter } = require('./middleware/rateLimiter');
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const redisClient = require("./config/redis");

const redisStore = new RedisStore({ client: redisClient });
require("dotenv").config(); // load .env

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === "test";

const isDeployed = isProduction;

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

app.set("trust proxy", 1); // trust 1 proxy for correct client IP and secure cookies behind proxies/load balancers

app.use(session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name:"dashboard.sid",
  cookie: {
    httpOnly: true,             // prevent client-side JS access
    secure: isDeployed,                // must be true on HTTPS
    sameSite: isDeployed ? 'none' : 'lax',            // required for cross-site requests
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  }
}));

app.use(cookieParser());

app.use(helmet()); // Set security-related HTTP headers

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://authentication-user-dashboard-app.onrender.com',
      'https://audaf-testing.onrender.com',
      'https://audab-testing.onrender.com'
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware globally
app.use(cors(corsOptions));

app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({extended:true})); // parse URL-encoded request bodies

// Apply rate limiters only in production to avoid hindering development and testing
if (isProduction) {
  app.use('/api/codeRequest/verifyCode', authLimiter);
  app.use('/api/codeRequest', emailLimiter);
  app.use('/api/user/loginUser', authLimiter);
  app.use('/api/user/createUser', authLimiter);
}

// Routes that are server API endpoints
app.use("/api/codeRequest", codeRequestRouter);
app.use("/api/user", userRouter);
app.use("/api/profile", profileImageRouter);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN" || err.message === "invalid csrf token") {
    return res.status(403).json({ error: "Invalid or missing CSRF token" });
  }
  next(err);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});