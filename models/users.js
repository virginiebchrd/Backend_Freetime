const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  civility: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  birthday: {
    type: Date,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // verified: {
  //   type: Boolean,
  //   default: false,
  // },
  token: {
    type: String,
    unique: true,
  }, 
  otherUsers: [
    {
      name: String,
      relationShip: String,
    },
  ],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
