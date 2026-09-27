import { asc, eq } from "drizzle-orm";
import { db } from "./db.js";
import { users } from "./schema.js";

export function readActiveUsers(orderBy: "name" | "id" = "name") {
  return db.select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(asc(users[orderBy]));
}

export async function readUserByEmail(email: string) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user;
}

export async function readUserById(userId: number) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
}

export async function readUserAccess(userId: number) {
  const [user] = await db.select({
    id: users.id,
    role: users.role,
    isActive: users.isActive,
  })
    .from(users)
    .where(eq(users.id, userId));

  return user;
}

export async function insertUser(input: Pick<typeof users.$inferInsert, "name" | "email" | "password">) {
  const [user] = await db.insert(users).values(input).returning();
  return user;
}
