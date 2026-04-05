const { z } = require("zod");
const { create } = require("./user");

const createUserSchema = z.object({
  email: z.string().email(),
  email_verified: z.boolean().default(false),
  verification_code: z.string().optional(),
  verification_expires: z.date().optional(),
  reset_code: z.string().optional(),
  reset_expires: z.date().optional(),
  password: z.string(),
  username: z.string().min(1),
  country: z.string().min(1),
  profileImageUrl: z.string().optional(),
  createdAt: z.date().optional(),
});

module.exports = {
  createUserSchema,
};