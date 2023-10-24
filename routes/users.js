var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require('../modules/checkBody');

const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const Hobby = require("../models/hobbies");

// Nouveau membre
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
      res.json({ result: false, error: 'User already exists' });
    }
  });
})

//Connexion avec une adresse mail
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

//Ajout des éléments du profil
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



//Ajout des relations pour un user donné
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



//TODO ajouter les activités validées par le user
router.post('/hobbies/:token', (req,res) => {
  if (!checkBody(req.body, ['hobbies'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  console.log(req.body.hobbies);
  const addActivity = req.body.hobbies;
  User.updateOne({token: req.params.token}, {$push: {hobbies: [...addActivity]}})
  .then( () => {
    User.findOne({token: req.params.token})
    .populate('hobbies')
    .then(data => {
      console.log(data);
      if(data) {
        res.json({result: true, hobbiesValidated: data})
      }
    })
  })
})

router.get('/hobbiesValidate/:token', (req,res) => {
  User.findOne({token: req.params.token})
  .populate('hobbies')
  .then(data => {
    console.log(data);
    res.json({result: true, hobbiesValidated: data});
  })
});

module.exports = router;
