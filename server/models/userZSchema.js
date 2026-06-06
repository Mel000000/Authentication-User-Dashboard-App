const { z } = require("zod");

const UserSchema = z.object({
  email: z.string().email(),
  email_verified: z.boolean().default(false),
  password: z.string().min(6),
  username: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  profileImageUrl: z.string().optional(),
  profileImagePublicId: z.string().optional(),
  verifyCode: z.string().optional(),
  verifyCodeExpires: z.date().optional(),
  createdAt: z.date().optional(),
});

module.exports = {
  UserSchema,
};