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
  console.log(req.body);

  Hobby.findById(req.params.id)
    .then(data => {
      if(data) {
        console.log("find",data.rating);
        if(!data.rating.some(e => e.token === req.body.token)) {
          //Hobby.findByIdAndUpdate(req.params.id, {$push: {rating: {token: req.body.token, myMark: req.body.myMark}}})
          Hobby.findOneAndUpdate({_id: req.params.id}, {$push: {rating: {token: req.body.token, myMark: req.body.myMark}}})
          .then(() => {
            Hobby.findById(req.params.id)
            .then(data3 => {
              const myMark = data3.rating.find(e => e.token = req.body.token)
              console.log('myMark', myMark);
              res.json({result: true, personalMark: myMark.myMark});
              //console.log("data3",data3);
            })
              
          })
          
        }
        else {
          res.json({result: false, error: 'marks already exists'});
        }
      }
      else {
        res.json({result: false, error: 'hobbies don\'t exist'})
      }
    })
})

router.get('/averageMarks/query', (req,res) => {
  const id_hobbies = req.query.id
  const token = req.query.token;

  Hobby.findById(id_hobbies)
  .then( findId => {
      console.log(findId._id);
      Hobby.aggregate([ {$unwind: "$rating"}, { $group: {_id : "$_id", avgRating: { $avg: "$rating.myMark"}} }])
      .then(average => {
        console.log('averag', average);
        if(average.some(e =>  new RegExp(id_hobbies).test(e._id))) {
          const averageHobbies = average.find(e =>  new RegExp(id_hobbies).test(e._id));
          if(findId.rating.some(e => e.token === token)) {
            const myMark = findId.rating.find(e => e.token === token)
            console.log("myMark",myMark);
            res.json({result: true, average: averageHobbies.avgRating, myMark: myMark.myMark})
          }
          else {
            res.json({result: true, average: averageHobbies.avgRating, error: 'no marks for this activities'})
          }
        }
        else {
          res.json({result: false, error: 'no average for this activities'})
        }
    })
  })
  
})


/*test avec query -> fonctionnel à changer les noms de la route et supprimer get avec 2 params*/
router.get('/category/query', (req,res) => {
  const category = req.query.category;
  const city = req.query.city;
  const day = req.query.day;
  console.log(category, city, day);

  Hobby.find({category: category, 
    "address.city": city,
    date: { $elemMatch: { ouverture: day }}
  })

      .then(data => {
        console.log(data);
        if(data.length> 0) {
            res.json({result: true, hobbies: data});
        }
        else {
            res.json({result: false, error: 'no hobbies in this category'});
        }
    })
})

//permet de recuperer des activités ouvert certains jours -> à ajouter dans les catégories de recherche
router.get('/test2/query', (req, res) => {
  const day = req.query.day;
  console.log('daySend', day);

  Hobby.find({date: { $elemMatch: { ouverture: day }}})
  .then(data => {
    console.log(data);
  })
})

module.exports = router;