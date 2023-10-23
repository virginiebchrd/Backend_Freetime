const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    city: String,
    district: String,
    street: String,
    zipCode: Number,
    latitude: Number,
    longitude: Number,
  }
)

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

  address: [addressSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
});

const Hobby = mongoose.model("hobbies", hobbySchema);

module.exports = Hobby;
