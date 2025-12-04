import { getValkeyInstance } from '$lib/server/valkey';

export class Caching {
  static async get<T = unknown>(key: string): Promise<T | null> {
    const redis = await getValkeyInstance();
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  static async set(key: string, value: unknown, { ttl = 3600 }: { ttl?: number } = {}) {
    const redis = await getValkeyInstance();
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  static async del(key: string) {
    const redis = await getValkeyInstance();
    await redis.del(key);
  }

  static async clear(startsWith: string) {
    const redis = await getValkeyInstance();
    const keys = await redis.keys(startsWith + '*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  static async nuke() {
    const redis = await getValkeyInstance();
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
