const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  email_verified : { type: Boolean, default: false },
  verification_code: { type: String },
  verification_expires: { type: Date },
  password: { type: String, required: true },
  reset_code: { type: String },
  reset_expires: { type: Date },
  username: { type: String, required: true },
  country: { type: String, required: true },
  profileImageUrl: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('User', userSchema);