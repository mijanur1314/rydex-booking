import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL || "");

export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  try {
    const key = `ratelimit:${identifier}`;
    
    // Increment the counter
    const current = await redis.incr(key);
    
    // Set expiry if it's the first request in the window
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    
    // Calculate remaining (can be negative if blocked, but usually we just cap at 0)
    const remaining = Math.max(0, limit - current);

    return {
      success: current <= limit,
      limit,
      remaining
    };
  } catch (error) {
    // Fail open if Redis is down so we don't break the app
    console.error("Rate limiter error:", error);
    return { success: true, limit, remaining: limit - 1 };
  }
}
