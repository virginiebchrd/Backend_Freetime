var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const User = require("../models/users");

// Register a new user
// ... existing imports and setup ...

router.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const hash = bcrypt.hashSync(password, 10);

    User.findOne({ email: req.body.email }).then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true });
      } else {
        res.json({ result: false });
      }
    });
    const { email, civility, lastname, firstname, birthday } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email); // Debugging statement
      return res.status(400).json({ message: "Email already registered" });
    }
    console.log(req.body.civility);
    // Create a new user
    const newUser = new User({
      email,
      password: hash,
      civility,
      lastname,
      firstname,
      birthday,
    });
    console.log(newUser);
    // Generate and store the verification token
    const token = uid2(32);
    newUser.token = token;
    // newUser.verified = false;
    console.log("New User Registered:", newUser);

    // Save the user to the database
    await newUser.save();

    // Debugging statement to verify data
    console.log("New User Registered:", newUser);
    // Send a success response
    res.status(201).json({
      message: "Registration successful.",
    });
  } catch (error) {
    console.log("Error during registration:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// add otherUsers

router.post("/addOtherUser/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const { name, relationShip } = req.body;

    const newOtherUser = { name, relationShip };

    user.otherUsers.push(newOtherUser);

    await user.save();

    res.status(201).json({ message: "OtherUser add successfully" });
  } catch (error) {
    console.error("Error to add otherUser :", error);
    res.status(500).json({ message: "Error to add a new otherUser" });
  }
});

// check otherUsers
router.get("/otherUsers/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otherUsers = user.otherUsers;

    res.status(200).json(otherUsers);
  } catch (error) {
    console.error("Error with otherUsers :", error);
    res.status(500).json({ message: "Failed to retrieve otherUsers" });
  }
});

// DELETE one otherUser
router.delete("/deleteOtherUser/:userId/:otherUserId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const otherUserId = req.params.otherUserId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otherUserIndex = user.otherUsers.findIndex(
      (ou) => ou._id.toString() === otherUserId
    );

    if (otherUserIndex === -1) {
      return res.status(404).json({ message: "OtherUser not found" });
    }

    user.otherUsers.splice(otherUserIndex, 1);

    await user.save();

    res.status(200).json({ message: "OtherUser delete" });
  } catch (error) {
    console.error("Error deleting an otherUser:", error);
    res.status(500).json({ message: "Failed to delete anotherUser" });
  }
});

// route get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error while fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
