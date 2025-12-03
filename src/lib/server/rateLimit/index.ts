import { dev } from '$app/environment';
import redis from '$lib/server/redis';

export async function rateLimit(
  ip: string,
  { limit = 60, windowS = 6000 }: { limit?: number; windowS?: number } = {}
) {
  if (dev) return; // Disable rate limiting in development
  const key = `rate-limit:${ip}`;
  const [current] = await redis.multi().incr(key).expire(key, windowS).exec();

  // @ts-expect-error current is a number
  if (current > limit) {
    throw new Error('Too many requests, please try again later.');
  }
}
