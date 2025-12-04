import { dev } from '$app/environment';
import { getValkeyInstance } from '$lib/server/valkey';

export async function rateLimit(
  ip: string,
  { limit = 60, windowS = 6000 }: { limit?: number; windowS?: number } = {}
) {
  if (dev) return; // Disable rate limiting in development
  const key = `rate-limit:${ip}`;
  const valkey = await getValkeyInstance();
  const results = await valkey.multi().incr(key).expire(key, windowS).exec();
  const current = results?.[0]?.[1] as number | undefined;
  if (current && current > limit) {
    throw new Error('Too many requests, please try again later.');
  }
}
