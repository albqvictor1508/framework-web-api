import * as e from "envalid"

export const env = e.cleanEnv(process.env, {
  DATABASE_URL: e.str(),
  PORT: e.port(),

  BUCKET_ACCESS_KEY_ID: e.str(),
  BUCKET_SECRET_ACCESS_KEY: e.str()
});
