import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger';
import Valkey from 'iovalkey';

let client: Valkey | null = null;

async function getValkeyInstance(): Promise<Valkey> {
  try {
    if (!client) {
      client = new Valkey(
        env.REDIS_PORT ? parseInt(env.REDIS_PORT, 10) : 6379,
        env.REDIS_HOST || 'localhost'
      );
      await client.connect();
    }
    return client;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
}

export { getValkeyInstance };
