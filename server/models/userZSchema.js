const { z } = require("zod");

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  username: z.string().min(1),
  country: z.string().min(1),
  profileImageUrl: z.string().optional(),
});

module.exports = {
  createUserSchema,
};