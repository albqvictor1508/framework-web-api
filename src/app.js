import express from "express"
import { env } from "./common/env.js";
import { user } from "./modules/user/index.js";
import cors from "cors";

export const app = express();

app.use(cors());
app.use(express.json());

app.use(user)

app.get("/health", (_, response) => {
  return response.status(200).json("OK")
});

app.listen(env.PORT, (err) => {
  if (err) return err;
  console.log(`API running on :${env.PORT}`)
})

