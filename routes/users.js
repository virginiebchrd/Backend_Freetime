var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require('../modules/checkBody');

const bcrypt = require("bcrypt");
const uid2 = require("uid2");

// Register a new user
// ... existing imports and setup ...

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
        password: hash,
        token: uid2(32),
      });

      newUser.save().then(newDoc => {
        console.log(newDoc)
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      // User already exists in database
      res.json({ result: false, error: 'User already exists' });
    }
  });
})

router.post('/signin', (req, res) => {
  if (!checkBody(req.body, ['email', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.findOne({ email: req.body.email }).then(data => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({ result: true, token: data.token });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
  });
});

router.post('/identity/:token', (req,res) => {
  if (!checkBody(req.body, ['civility', 'lastname', 'firstname',])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.updateOne({token: req.params.token}, {$set :{civility: req.body.civility, lastname:req.body.lastname, firstname: req.body.firstname, birthday: req.body.birthday}})
  .then(() => {
      User.findOne({token: req.params.token}).then(user => {
      if(user) {
        console.log(user);
          res.json({result: true, token: user.token});
      }
      else {
        res.json({result: true, error: 'user not found' });
      }
    })
  })
})

//TODO récupérer toutes les activités pour un user
/*router.get('/hobbies/:token', (res,req) => {
  User.findOne({token: req.params.token}).then( () => {

  })
});*/

//TODO ajouter les relations pour un user donné
router.post('/relationShip/:token', (req,res) => {
  if (!checkBody(req.body, ['name', 'relationShip'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.updateOne({token: req.params.token}, {$set: {otherUsers: {relationShip: req.body.relationShip, name: req.body.name}}})
  .then( () => {
    User.findOne({token: req.params.token}).then( user => {
      if(user) {
        console.log(user);
        res.json({result: true, token: user.token});
      }
      else {
        res.json({result: false, error: 'User not found' });
      }
    })
  })

})

//TODO route get pour récupérer les activités dans une zone définie

//TODO afficher les activités choisis par le user

//TODO ajouter les activités validées par le user
router.post('/hobbies/:token', (req,res) => {
  if (!checkBody(req.body, ['name', 'relationShip'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.updateOne({token: req.params.token}, {$set: {hobbies: req.body.hobbies}})
  .then( () => {
    User.findOne({token: req.params.token}).then( user => {
      if(user) {
        console.log(user);
        res.json({result: true, token: user.token, hobbies: user.hobbies});
      }
      else {
        res.json({result: false, error: 'User not found' });
      }
    })
  })

})
/*router.post("/register", async (req, res) => {
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

    const token = uid2(32);
    // Create a new user
    const newUser = new User({
      token: token,
      email,
      password: hash,
      civility,
      lastname,
      firstname,
      birthday,
    });
    console.log(newUser);

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
});*/

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
