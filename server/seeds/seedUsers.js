require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");

// ----- CONFIG -----
const MONGO_URI = process.env.MONGO_URI;
const NUMBER_OF_USERS = 50; // change as needed
const DEFAULT_PASSWORD = "password123";

// ----- SAMPLE DATA -----
const countries = ["USA", "Germany", "France", "Canada", "UK", "Australia"];

const randomFromArray = (arr) =>
  arr[Math.floor(Math.random() * arr.length)];

const generateUser = async (index) => {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  return {
    email: `user${index}@example.com`,
    password: hashedPassword,
    username: `user_${index}`,
    country: randomFromArray(countries),
    profileImageUrl: `https://i.pravatar.cc/150?img=${index % 70}`,
  };
};

// ----- SEED FUNCTION -----
const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Optional: clear existing users
    await User.deleteMany({});
    console.log("Existing users removed");

    const users = [];
    for (let i = 1; i <= NUMBER_OF_USERS; i++) {
      users.push(await generateUser(i));
    }

    await User.insertMany(users);
    console.log(`✅ ${NUMBER_OF_USERS} users seeded successfully`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedUsers();
