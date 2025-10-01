import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text("email").unique().notNull(),
  avatar: text().notNull(),
  password: text(),
  phone: text().unique().notNull()
});

export const schema = { users }
