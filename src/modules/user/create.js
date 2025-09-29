import express from "express"
import { db } from "../../db/client.js";
import { users } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt"
import { z } from "zod"

const router = express.Router();

const bodySchema = z.object({
  name: z.string().min(3).max(70),
  email: z.email(),
  password: z.string().min(6).max(25),
  phone: z.string()
})

router.post("/users", async (request, response) => {
  const { name, email, password, phone } = request.body

  try {
    bodySchema.parse(request.body);
  } catch (err) {
    return response.status(400).json({ error: true, message: "invalid body" });
  }
  console.log(email)

  const [emailExist] = await db.select({ id: users.id }).from(users).where(eq(users.email, email))
  if (emailExist) return response.status(400).json({ error: true, message: "email already in use!" })

  const [phoneExist] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone))
  if (phoneExist) return response.status(400).json({ error: true, message: "phone already in use!" })

  const hashed = await bcrypt.hash(password, 10)

  await db.insert(users).values({
    name,
    email,
    password: hashed,
    phone
  });

  return response.status(201).json();
})

router.get("/users", async (request, reply) => {
  return reply.status(200).json(await db.select().from(users));
})

export const user = router;
