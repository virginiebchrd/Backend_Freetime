const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: String,
    password: String,
    token: String,
});

const User = mongoose.model('users', userSchema);

module.exports = User;