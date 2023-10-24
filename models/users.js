const mongoose = require("mongoose");

const otherUsersSchema = mongoose.Schema({
  relationShip: String,
  name: String,
})

const userSchema = mongoose.Schema({
  civility: String,
  lastname: String,
  firstname: String,
  birthday: Date,
  email: String,
  password: String,
  token: String,
  hobbies: [{type: mongoose.Schema.Types.ObjectId, ref: 'hobbies'}],
  otherUsers: [ otherUsersSchema ],
});

const User = mongoose.model('users', userSchema);

module.exports = User;
