import { PutObjectCommand } from "@aws-sdk/client-s3";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import express from "express";
import multer from "multer";
import { z } from "zod";
import { s3cli } from "../../common/bucket.js";
import { redis } from "../../common/cache.js";
import { db } from "../../db/client.js";
import { students, students, users } from "../../db/schema/index.js";

const router = express.Router();

const m = multer({ storage: multer.memoryStorage() });

const bodySchema = z.object({
  name: z.string().min(3).max(70),
  email: z.email(),
  password: z.string().min(6).max(25),
  phone: z.string(),
  firstNote: z.number().max(10).min(0),
  secondNote: z.number().max(10).min(0)
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.post("/users", m.single("avatar"), async (request, response) => {
  const file = request.file;

  try {
    bodySchema.parse(request.body);
  } catch (err) {
    return response.status(400).json({ error: true, message: "Corpo da requisição inválido." });
  }
  const { name, email, password, phone, firstNote, secondNote } = request.body;

  const [emailExist] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  if (emailExist) return response.status(400).json({ error: true, message: "Email já está em uso." });

  const [phoneExist] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone));
  if (phoneExist) return response.status(400).json({ error: true, message: "Telefone já está em uso." });

  let avatarUrl = null;

  if (file) {
    const fileName = generateFileName();

    const command = new PutObjectCommand({
      Bucket: env.BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await s3cli.send(command);
      avatarUrl = `https://${env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${fileName}`;
    } catch (error) {
      console.error("Erro ao fazer upload para o S3:", error);
      return response.status(500).json({ error: true, message: "Falha ao enviar o avatar." });
    }
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    await db.insert(students).values({
      name,
      email,
      password: hashed,
      phone,
      avatar: avatarUrl,
      firstNote,
      secondNote
    });
  } catch (dbError) {
    console.error("Erro na inserção no banco de dados:", dbError);
    return response.status(500).json({ error: true, message: "Falha ao criar o usuário." });
  }

  return response.status(201).json();
})

router.get("/users", async (request, response) => {
  if (await redis.exists("students")) return response.status(200).json(JSON.parse(await redis.get("users")))

  const students = await db.select({ id: students.id, name: students.name, avatar: students.avatar }).from(students);
  redis.setex("users", '120', JSON.stringify(students));

  return response.status(200).json(students);

})

router.get("/users/:id", async (request, response) => {
  const { id } = request.params
  if (await redis.exists(`students:${id}`)) return response.status(200).json(JSON.parse(await redis.get(`students:${id}`)))

  const student = await db.select().from(students).where(eq(students.id, id));
  if (!student) return response.status(400).json({ error: "Invalid student ID" })

  redis.setex(`students:${id}`, '120', JSON.stringify(student));

  return response.status(200).json(students);

})
export const user = router;
