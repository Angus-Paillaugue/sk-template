import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger';
import Valkey from 'iovalkey';

let client: Valkey | null = null;
let connectionPromise: Promise<Valkey> | null = null;

async function getValkeyInstance(): Promise<Valkey> {
  try {
    if (client) {
      return client;
    }

    if (connectionPromise) {
      return connectionPromise;
    }

    connectionPromise = (async () => {
      client = new Valkey(
        env.REDIS_PORT ? parseInt(env.REDIS_PORT, 10) : 6379,
        env.REDIS_HOST || 'localhost'
      );
      await client.connect();
      return client;
    })();

    return connectionPromise;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    connectionPromise = null;
    throw error;
  }
}

export { getValkeyInstance };
