const express = require("express");
const axios = require("axios");
const User = require("../models/user");
const { createUserSchema } = require("../models/userZSchema");

const router = express.Router();

router.post("/createUser", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  console.log("Received user data:", req.body);

  if (!parsed.success) {
    console.log("Zod validation failed:", parsed.error.errors);
    return res.status(400).json({ error: "Invalid input", details: parsed.error.errors });
    }


  try {
    const newUser = new User(parsed.data);
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

module.exports = router;