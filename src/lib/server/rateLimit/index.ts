import { dev } from '$app/environment';
import { getValkeyInstance } from '$lib/server/valkey';

export async function rateLimit(
  ip: string,
  { limit = 60, windowS = 6000 }: { limit?: number; windowS?: number } = {}
) {
  if (dev) return; // Disable rate limiting in development
  const key = `rate-limit:${ip}`;
  const redis = await getValkeyInstance();
  const [current] = await redis.multi().incr(key).expire(key, windowS).exec();

  if (current > limit) {
    throw new Error('Too many requests, please try again later.');
  }
}
