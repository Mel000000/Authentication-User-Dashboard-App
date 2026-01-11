const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  country: { type: String, required: true },
  profileImageUrl: { type: String, required: false },
});


module.exports = mongoose.model('User', userSchema);