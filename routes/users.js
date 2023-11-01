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
        res.json({ result: true, token: newDoc.token, email: newDoc.email  });
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
      console.log(data);
      res.json({ result: true, token: data.token, email: data.email });
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

  User.updateOne({token: req.params.token}, {$set :{civility: req.body.civility, lastname:req.body.lastname, firstname: req.body.firstname, birthday: req.body.birthday,
                                                    hobbies: {
                                                      perso : [],
                                                      famille: [],
                                                      amis: [],
                                                    }
  }})
  .then(() => {
      User.findOne({token: req.params.token}).then(user => {
      if(user) {
        console.log(user);
          res.json({result: true, identity: user});
      }
      else {
        res.json({result: true, error: 'user not found' });
      }
    })
  })
})

//récuperer info du user
router.get('/identity/:token', (req,res) => {
  User.findOne({token: req.params.token})
  .then(data => {
    if(data) {
      res.json({result: true, identity: {
        token: data.token,
        lastname: data.lastname,
        firstname: data.firstname,
      }})
    } else {
      res.json({result: false, error: 'User not found'})
    }
  })
})



//Ajout des relations pour un user donné
router.post('/relationShip/:token', (req,res) => {
  if (!checkBody(req.body, ['name', 'relationShip'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  User.updateOne({token: req.params.token}, {$set: {otherUsers: {relationShip: req.body.relationShip, name: req.body.name} }})
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

//Ajouter les activités validées par le user
router.post('/hobbies/query/', (req,res) => {
  if (!checkBody(req.body, ['hobbies'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const token = req.query.token;
  const who = req.query.who;

  console.log('token + who',token , who);
  const id_activity_saved = req.body.hobbies;
  console.log(id_activity_saved);
  Hobby.findById(id_activity_saved).then(findId => {
    console.log('findId',findId);
    User.findOne({token})
    .then(findUser => {
      
      if(who==='perso') {
        if(!findUser.hobbies.perso.some(e => new RegExp(findId._id).test(e._id)))
        {
          User.updateOne({token}, {$push: {"hobbies.perso": findId}})
          .then(() => {
            User.findOne({token})
            .populate('hobbies.amis')
            .populate('hobbies.famille')
            .populate('hobbies.perso')
            .then(data => {
              res.json({result: true, hobbies: data.hobbies, token: data.token})
            })
          })
        }
        else {
          res.json({result: false, error: 'hobbies already added'})
        }
      }
      else if(who==='famille') {
        if(!findUser.hobbies.famille.some(e => new RegExp(findId._id).test(e._id)))
        {
          User.updateOne({token}, {$push: {"hobbies.famille": findId}})
          .then(() => {
            User.findOne({token})
            .populate('hobbies.amis')
            .populate('hobbies.famille')
            .populate('hobbies.perso')
            .then(data => {
              res.json({result: true, hobbies: data.hobbies, token: data.token})
            })
          })
        }
        else {
          res.json({result: false, error: 'hobbies already added'})
        }
      }
      else if(who==='amis') {
        if(!findUser.hobbies.amis.some(e => new RegExp(findId._id).test(e._id)))
        {
          User.updateOne({token}, {$push: {"hobbies.amis": findId}})
          .then(() => {
            User.findOne({token})
            .populate('hobbies.perso')
            .populate('hobbies.famille')
            .populate('hobbies.amis')
            .then(data => {
              res.json({result: true, hobbies: data.hobbies, token: data.token})
            })
          })
        }
        else {
          res.json({result: false, error: 'hobbies already added'})
        }
      }
    })
  })
})

router.get('/hobbiesValidate/:token', (req,res) => {
  User.findOne({token: req.params.token})
  .populate('hobbies.perso')
  .populate('hobbies.famille')
  .populate('hobbies.amis')
  .then(data => {
    console.log(data.hobbies);
    res.json({result: true, 
      hobbiesValidatedPerso: data.hobbies.perso,
      hobbiesValidatedFamille: data.hobbies.famille,
      hobbiesValidatedAmis: data.hobbies.amis,
    });
  })
});

//Retirer une activité validée
router.put('/delete/query', (req,res) => {
  const idAct= req.query.id;
  const token= req.query.token;
  const who = req.query.who;

  if(who === 'famille') {
    User.updateOne({token: token}, {$pull :{"hobbies.famille":  idAct}})
    .then(() => {
      User.findOne({token: token})
      .populate('hobbies')
      .then(data => {
        console.log(data);
        res.json({result: true, hobbies: data})
      })
    })
  }
  else if(who === 'amis') {
    User.updateOne({token: token}, {$pull :{"hobbies.amis":  idAct}})
    .then(() => {
      User.findOne({token: token})
      .populate('hobbies')
      .then(data => {
        console.log(data);
        res.json({result: true, hobbies: data})
      })
    })
  }
  else if(who === 'perso') {
    User.updateOne({token: token}, {$pull :{"hobbies.perso":  idAct}})
    .then(() => {
      User.findOne({token: token})
      .populate('hobbies')
      .then(data => {
        console.log(data);
        res.json({result: true, hobbies: data})
      })
    })
  }
});

module.exports = router;
