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

//router.get('/:category', (req, res) => {
router.get('/:category/:city', (req, res) => {
  console.log(req.params);

    Hobby.find({category: req.params.category, 
    "address.city": req.params.city})
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

router.post('/rating/:id', (req,res) => {
  console.log(req.body.myMark);
  //Hobby.findOne({_id: req.params.id})
  Hobby.updateOne({_id: req.params.id}, {$push: {rating: req.body.myMark}})
  .then(data => {
    console.log(data);
    res.json({result: true})
  })
})

/*router.get('/averageMarks/:id', (req,res) => {
  console.log('ici');

  let test = Hobby.aggregate([ { $group: {_id : "$name", avgRating: { $avg: "$rating"}} }])
  console.log(test);
  
})*/

module.exports = router;