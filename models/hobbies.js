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

const marksSchema = mongoose.Schema({
  token: String,
  myMark: Number,
})

const hobbySchema = mongoose.Schema({
  category: String,
  name: String,
  phoneNumber: String,
  email: String,
  date: Date,
  site: String,
  rating: [marksSchema],
  addresse: addressSchema,
});

const Hobby = mongoose.model("hobbies", hobbySchema);

module.exports = Hobby;

