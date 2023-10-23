var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");

const uid2 = require("uid2");
const User = require("../models/users");

// Register a new user
// ... existing imports and setup ...

router.post("/register", async (req, res) => {
  try {
    const { email, password, civility, lastname, firstname, birthday } =
      req.body;

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
      password,
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
      message:
        "Registration successful.",
    });
  } catch (error) {
    console.log("Error during registration:", error); // Debugging statement
    res.status(500).json({ message: "Registration failed" });
  }
});

// //endpoint to verify the email
// router.get("/verify/:token", async (req, res) => {
//   try {
//     const token = req.params.token;

//     //Find the user without the given verification token
//     const user = await User.findOne({ verificationToken: token });
//     if (!user) {
//       return res.status(404).json({ message: "Invalid verification token" });
//     }

//     //Mark the user as verified
//     user.verified = true;
//     user.verificationToken = undefined;

//     await user.save();

//     res.status(200).json({ message: "Email verified successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Email Verificatiion Failed" });
//   }
// });

// //endpoint to store a new address to the backend
// router.post("/addresses", async (req, res) => {
//   try {
//     const { userId, address } = req.body;

//     //find the user by the Userid
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     //add the new address to the user's addresses array
//     user.addresses.push(address);

//     //save the updated user in te backend
//     await user.save();

//     res.status(200).json({ message: "Address created Successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Error addding address" });
//   }
// });
// //get the user profile
// router.get("/profile/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json({ user });
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving the user profile" });
//   }
// });

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
