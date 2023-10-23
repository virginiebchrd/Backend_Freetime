const mongoose = require("mongoose");

const hobbySchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
  },

  adress: { type: mongoose.Schema.Types.ObjectId, ref: "hobbyAdress._id" },
  address: [
    {
      city: String,
      district: String,
      street: String,
      street: String,
      zipCode: Number,
      latitude: Number,
      longitude: Number,
    },
  ],
});

const Hobby = mongoose.model("hobbies", hobbySchema);

module.exports = Hobby;
