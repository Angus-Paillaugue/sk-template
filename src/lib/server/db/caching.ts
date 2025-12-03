import redis from '$lib/server/redis';

export class Caching {
  static async get<T = unknown>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  static async set(
    key: string,
    value: unknown,
    { ttl = 3600, condition = 'NX' }: { ttl?: number; condition?: 'NX' | 'XX' } = {}
  ) {
    await redis.set(key, JSON.stringify(value), {
      expiration: {
        type: 'EX',
        value: ttl,
      },
      condition: condition, // Only set if the key does not already exist
    });
  }

  static async del(key: string) {
    await redis.del(key);
  }

  static async clear(startsWith: string) {
    const keys = await redis.keys(startsWith + '*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }

  static async nuke() {
    const keys = await redis.keys('*');
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}
