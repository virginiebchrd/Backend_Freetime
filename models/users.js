const mongoose = require("mongoose");

const otherUsersSchema = mongoose.Schema({
  relationShip: String,
  name: String,
})

const hobbiesSchema = mongoose.Schema({
  perso: [{type: mongoose.Schema.Types.ObjectId, ref: 'hobbies'}],
  famille: [{type: mongoose.Schema.Types.ObjectId, ref: 'hobbies'}],
  amis: [{type: mongoose.Schema.Types.ObjectId, ref: 'hobbies'}]
  })

const userSchema = mongoose.Schema({
  civility: String,
  lastname: String,
  firstname: String,
  birthday: Date,
  email: String,
  password: String,
  token: String,
  hobbies: hobbiesSchema,
  otherUsers: [ otherUsersSchema ],
});

const User = mongoose.model('users', userSchema);

module.exports = User;
