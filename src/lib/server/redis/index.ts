import { env } from '$env/dynamic/private';
import { logger } from '$lib/utils/logger';
import { createClient } from 'redis';

let redis: ReturnType<typeof createClient>;

try {
  redis = await createClient({
    socket: {
      host: env.REDIS_HOST || 'localhost',
      port: env.REDIS_PORT ? parseInt(env.REDIS_PORT, 10) : 6379,
    },
  })
    .on('error', (err) => logger.error('Redis Client Error', err))
    .connect();
} catch (error) {
  logger.error('Failed to connect to redis:', error);
  throw error;
}

export default redis;
