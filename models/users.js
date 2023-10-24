const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  civility: String,
  lastname: String,
  firstname: String,
  birthday: Date,
  email: String,
  password: String,
  token: String,
  hobbies: {type: mongoose.Schema.Types.ObjectId, ref: 'hobbies'},
  otherUsers: [
    {
      name: String,
      relationShip: String,
    },
  ],
});

const User = mongoose.model('users', userSchema);

module.exports = User;
