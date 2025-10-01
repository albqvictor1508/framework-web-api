import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis({ port: env.REDIS_PORT, host: env.REDIS_URL });
