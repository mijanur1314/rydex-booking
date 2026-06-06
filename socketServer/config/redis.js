import Redis from "ioredis";

/**
 * Initializes and exports the Redis client instances.
 * Includes error handling for connection issues.
 */
const initRedis = () => {
  if (!process.env.UPSTASH_REDIS_URL) {
    console.error("UPSTASH_REDIS_URL environment variable is not defined.");
    process.exit(1);
  }

  const redis = new Redis(process.env.UPSTASH_REDIS_URL);
  const pubClient = new Redis(process.env.UPSTASH_REDIS_URL);
  const subClient = pubClient.duplicate();

  redis.on("error", (err) => console.error("Redis error:", err.message));
  pubClient.on("error", (err) => console.error("Redis PubClient error:", err.message));
  subClient.on("error", (err) => console.error("Redis SubClient error:", err.message));

  return { redis, pubClient, subClient };
};

export const { redis, pubClient, subClient } = initRedis();
