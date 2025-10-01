import express from "express"
import { db } from "../../db/client.js";
import { users } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt"
import { z } from "zod"
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { s3cli } from "../../common/bucket.js";

const router = express.Router();

const m = multer({ storage: multer.memoryStorage() });

const bodySchema = z.object({
  name: z.string().min(3).max(70),
  email: z.email(),
  password: z.string().min(6).max(25),
  phone: z.string()
});

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

router.post("/users", m.single("avatar"), async (request, response) => {
  const file = request.file;

  try {
    bodySchema.parse(request.body);
  } catch (err) {
    return response.status(400).json({ error: true, message: "Corpo da requisição inválido." });
  }
  const { name, email, password, phone } = request.body;

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
    await db.insert(users).values({
      name,
      email,
      password: hashed,
      phone,
      avatar: avatarUrl,
    });
  } catch (dbError) {
    console.error("Erro na inserção no banco de dados:", dbError);
    return response.status(500).json({ error: true, message: "Falha ao criar o usuário." });
  }

  return response.status(201).json();
})

router.get("/users", async (request, response) => {
  return response.status(200).json(await db.select().from(users));
})

export const user = router;
