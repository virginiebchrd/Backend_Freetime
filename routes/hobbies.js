var express = require("express");
var router = express.Router();

const Hobby = require("../models/hobbies");
const User = require("../models/users");

// Hobbies

router.post("/:userId", async (req, res) => {
  try {
    const { category, name, email, date, address } = req.body;
    console.log(req.body.address)
    const userId = req.params.userId;
   
    // const addressJSON = JSON.stringify(req.body.address);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //create a new hobby
    const hobby = new Hobby({
      category: req.body.category,
      name: req.body.name,
      email: req.body.email,
      date: req.body.date,
      address: req.body.address,
      user: userId,
      
    });

    await hobby.save();

    res.status(201).json({ message: "Hobby created successfully!" });
  } catch (error) {
    console.log("error creating hobby", error);
    res.status(500).json({ message: "Error creating hobby" });
  }
});


// GET all hobbies from user
router.get("/:userId/hobbies", async (req, res) => {
  try {
    const userId = req.params.userId;

    const hobbies = await Hobby.find({ user: userId }).populate("user");

    if (!hobbies || hobbies.length === 0) {
      return res
        .status(404)
        .json({ message: "No hobbies found for this user" });
    }

    res.status(200).json({ hobbies });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Delete hobby
router.delete("/:hobbyId", async (req, res) => {
  try {
    const hobbyId = req.params.hobbyId;

    const deletedHobby = await Hobby.findByIdAndRemove(hobbyId);

    if (!deletedHobby) {
      return res.status(404).json({ message: "Hobby not found" });
    }

    res.status(200).json({ message: "Hobby deleted successfully" });
  } catch (error) {
    console.error("Error", error);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
