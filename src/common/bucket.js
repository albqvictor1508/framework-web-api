import { createClient } from "s3"
import { env } from "./env"

export const s3cli = createClient({
  s3Options: {
    accessKeyId: env.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: env.BUCKET_SECRET_ACCESS_KEY
  }
})
