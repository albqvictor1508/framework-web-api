import * as e from "envalid"

export const env = e.cleanEnv(process.env, {
  DATABASE_URL: e.str(),
  PORT: e.port(),
});
