import bcrypt from "bcrypt";
import { insertUser, readUserByEmail, readUserById } from "#db/userQueries.js";
import type { PublicUser, User } from "#types/index.js";
import { apiError } from "#utils/apiError.js";
import type { LoginInput, RegisterInput } from "#validation/authSchemas.js";

const PASSWORD_HASH_ROUNDS = 10;

export async function registerUser({ name, email, password }: RegisterInput) {
  const existingUser = await readUserByEmail(email);
  if (existingUser) throw apiError(400, "Email already exists");

  const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  const user = await insertUser({ name, email, password: passwordHash });
  if (!user) throw apiError(400, "Registration Failed");

  return user;
}

export async function authenticateUser({ email, password }: LoginInput) {
  const user = await readUserByEmail(email);
  if (!user) throw apiError(401, "Invalid Credentials");

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw apiError(401, "Invalid Credentials");

  return user;
}

export async function getCurrentUser(userId: number) {
  const user = await readUserById(userId);
  if (!user) throw apiError(404, "User not found");
  return toPublicUser(user);
}

export function toPublicUser(user: User): PublicUser {
  const { password: _password, ...publicUser } = user;
  return publicUser;
}
