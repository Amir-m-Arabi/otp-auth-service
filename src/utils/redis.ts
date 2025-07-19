import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});
