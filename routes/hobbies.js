var express = require("express");
var router = express.Router();

const Hobby = require("../models/hobbies");
const User = require("../models/users");

const { checkBody } = require('../modules/checkBody');

router.post('/new', (req,res) => {
    if (!checkBody(req.body, ['hobbies'])) {
        res.json({ result: false, error: 'Missing or empty fields' });
        return;
    }
    /*console.log({name: req.body.hobbies.name, 
                    "address.city": req.body.hobbies.address.city, 
                    "address.street": req.body.hobbies.address.street});*/

    Hobby.findOne({name: req.body.hobbies.name},
                    {address: {city: req.body.hobbies.address.city, 
                            street: req.body.hobbies.address.street } })

    .then(data => {
        console.log(data);
        if(data !== null) {
            res.json({result: false, error: 'Hobby already existed'} )
        }
        else {
            const address = {
                city: req.body.hobbies.address.city,
                district: req.body.hobbies.address.district,
                street: req.body.hobbies.address.street,
                zipCode: req.body.hobbies.address.zipCode,
                latitude: req.body.hobbies.address.latitude,
                longitude: req.body.hobbies.address.longitude,
            }
        
            const newHobbies = new Hobby ({
                name: req.body.hobbies.name,
                category : req.body.hobbies.category,
                phoneNumber: req.body.hobbies.phoneNumber,
                email: req.body.hobbies.email,
                date: req.body.hobbies.date,
                address: address,
            });
        
            newHobbies.save().then(newHobby => {
                res.json({result: true, hobbies: newHobby})
            })
        }
    })
})

router.get('/:category/:city', (req, res) => {
  console.log(req.params);

    Hobby.find({category: req.params.category}, 
    {"address.city": req.params.city})
    .then(data => {
        console.log(data);
        if(data.length> 0) {
            res.json({result: true, hobbies: data});
        }
        else {
            res.json({result: false, error: 'no hobbies in this category'});
        }
    })
});

// récupérer toutes les activités pour un user
router.get('/users/:token', (req,res) => {
    User.findOne({token: req.params.token})
    .populate('hobbies')
    .then( data => {
      console.log(data);
      if(data) {
        if(data.hobbies.length > 0) {
          res.json({result: true, hobbies: data.hobbies})
        }
        else {
          res.json({result: false, error: 'no hobbies'})
        }
      }
      else {
        res.json({result: false, error: 'User not found'})
      }
    })
  });

//TODO route get pour récupérer les activités dans une zone définie

// afficher les activités choisis par le user
router.get('/each/:id', (req,res) => {
  let tabId= req.params.id.split(",");
  console.log(tabId);
  Hobby.find({_id : {$in : tabId}})
  .then(data => {
    console.log(data);
    if(data) {
      res.json({result: true, hobby: data})
    }
    else {
      res.json({result: false, error: 'hobby not found'});
    }

  })
})

module.exports = router;


/*var express = require("express");
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

module.exports = router;*/
