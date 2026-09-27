import z from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "name must be at least 2 characters"),
  email: z.email("a valid email is required"),
  password: z.string().min(6, "password must be at least 6 characters"),
}).strict();

export const loginSchema = registerSchema.pick({
  email: true,
  password: true,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
