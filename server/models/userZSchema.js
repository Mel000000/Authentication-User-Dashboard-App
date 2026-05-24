const { z } = require("zod");

const createUserSchema = z.object({
  email: z.string().email(),
  email_verified: z.boolean().default(false),
  password: z.string(),
  username: z.string().min(1),
  country: z.string().min(1),
  profileImageUrl: z.string().optional(),
  profileImagePublicId: z.string().optional(),
  verifyCode: z.string().optional(),
  verifyCodeExpires: z.date().optional(),
  createdAt: z.date().optional(),
});

module.exports = {
  createUserSchema,
};