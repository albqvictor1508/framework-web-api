import { drizzle } from 'drizzle-orm/libsql';
import { env } from '../common/env.js';
import { schema } from './schema/index.js';

export const db = drizzle({
  connection: { url: env.DATABASE_URL },
  schema,
  casing: "snake_case"
});
