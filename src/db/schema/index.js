import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const students = sqliteTable("students", {
  id: integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text("email").unique().notNull(),
  avatar: text().notNull(),
  password: text(),
  birthdate: text().notNull(),
  phone: text().unique().notNull(),
  firstNote: integer().notNull(),
  secondNote: integer().notNull(),
});

export const schema = { users }
