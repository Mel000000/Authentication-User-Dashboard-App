const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  email_verified : { type: Boolean, default: false },
  password: { type: String},
  username: { type: String},
  country: { type: String},
  profileImageUrl: {
    type: String,
    default: 'https://i.pravatar.cc/150'
  },
  profileImagePublicId: {
    type: String,
    default: null
  },
  verifyCode: { type: String },
  verifyCodeExpires: { type: Date, default: () => Date.now() + 10*60*1000 }, // 10 minutes from now
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('User', userSchema);